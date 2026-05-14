// ═══════════════════════════════════════════════════════════════════════════
//  script.js  –  Study To-Do List
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. Entry point: runs after all HTML elements are ready ─────────────────
// This section sets up the initial state of the webpage once it fully loads.
// It fetches existing tasks, displays them, and attaches event listeners 
// to buttons (like adding a new task or fetching a motivational quote) 
// so they respond to user clicks.
document.addEventListener("DOMContentLoaded", async function () {

    tasks = await loadTasks();
    displayTasks(tasks);

    // Add Task button
    document.querySelector("#addTodo").addEventListener("click", function () {
        const subject   = document.querySelector("#subject").value;
        const dateStudy = document.querySelector("#dateStudy").value;
        const duration  = document.querySelector("#duration").value;
        const urgency   = document.querySelector("#urgency").value;

        if (!dateStudy || !duration) {
            Swal.fire("Oops!", "Please fill in the date and duration.", "warning");
            return;
        }

        addTask(tasks, subject, dateStudy, duration, urgency);
        console.log(tasks)
        saveTasks(tasks);
        displayTasks(tasks);
        postTaskToAPI(tasks[tasks.length - 1]);
    });

    // LO12: Get Study Quote button — calls Quotable.io SaaS REST API
    document.querySelector("#fetchQuoteBtn").addEventListener("click", function () {
        fetchStudyQuote();
    });

});

// ── 2. Display all tasks ───────────────────────────────────────────────────
// This function takes the array of tasks and renders them onto the webpage. 
// It clears the current list, iterates through the tasks, creates HTML elements 
// for each one, and adds functional "Delete" and "Edit" buttons to each task item.
function displayTasks(tasks) {
    const taskListUl = document.querySelector("#taskList");
    taskListUl.innerText = "";

    for (let t of tasks) {
        const liElement = document.createElement("li");
        liElement.className = "list-group-item task-card";
        const urgencyClass = getUrgencyClass(t.urgency);

        liElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-12 col-md-3 fw-bold">${t.subject}</div>
            <div class="col-6 col-md-2 text-muted small">📅 ${formatDate(t.dateStudy)}</div>
            <div class="col-6 col-md-2 text-muted small">⏱ ${t.duration}</div>
            <div class="col-6 col-md-2">
                <span class="badge ${urgencyClass} text-white">Urgency: ${t.urgency}</span>
            </div>
            <div class="col-6 col-md-3 text-end">
                <button class="btn btn-danger btn-sm me-1 delete-btn">🗑 Delete</button>
                <button class="btn btn-success btn-sm update-btn">✏️ Edit</button>
            </div>
        </div>`;

        // Delete button
        liElement.querySelector(".delete-btn").addEventListener("click", function () {
            Swal.fire({
                title: "Delete this task?",
                text: `"${t.subject}" will be removed.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it"
            }).then(function (result) {
                if (result.isConfirmed) {
                    deleteTask(tasks, t.id);
                    displayTasks(tasks);
                }
            });
        });

        // Edit button
        liElement.querySelector(".update-btn").addEventListener("click", function () {
            Swal.fire({
                title: `Edit Task: ${t.subject}`,
                html: buildEditForm(t),
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: "Save Changes",
                preConfirm: function () {
                    const newSubject  = document.querySelector("#editSubject").value;
                    const newDate     = document.querySelector("#editDate").value;
                    const newDuration = document.querySelector("#editDuration").value;
                    const newUrgency  = document.querySelector("#editUrgency").value;

                    if (!newDate || !newDuration) {
                        Swal.showValidationMessage("Date and duration are required.");
                        return false;
                    }

                    updateTask(tasks, t.id, newSubject, newDate, newDuration, newUrgency);
                    displayTasks(tasks);
                }
            });
        });

        taskListUl.appendChild(liElement);
    }
}

// ── 3. Build edit modal HTML ───────────────────────────────────────────────
// This helper function generates the HTML structure for the "Edit Task" popup 
// modal. It pre-populates the input fields (subject, date, duration, urgency) 
// with the existing data of the task the user wants to edit.
function buildEditForm(t) {
    const subjects = ["Mathematics", "Chinese", "English", "Science"];
    const subjectOptions = subjects.map(function (s) {
        return `<option value="${s}" ${s === t.subject ? "selected" : ""}>${s}</option>`;
    }).join("");

    let urgencyOptions = "";
    for (let u = 1; u <= 5; u++) {
        urgencyOptions += `<option value="${u}" ${u == t.urgency ? "selected" : ""}>${u}</option>`;
    }

    return `
        <div class="mb-2"><label class="form-label">Subject</label>
            <select id="editSubject" class="form-select">${subjectOptions}</select></div>
        <div class="mb-2"><label class="form-label">Date of Study</label>
            <input type="date" id="editDate" class="form-control" value="${t.dateStudy}"></div>
        <div class="mb-2"><label class="form-label">Duration (hh:mm)</label>
            <input type="time" id="editDuration" class="form-control" value="${t.duration}"></div>
        <div class="mb-2"><label class="form-label">Urgency</label>
            <select id="editUrgency" class="form-select">${urgencyOptions}</select></div>`;
}

// ── 4. Return CSS badge class based on urgency ─────────────────────────────
// This function maps the numerical urgency value (1-5) to a specific CSS class name. 
// This allows the task UI to color-code the urgency badge accordingly.
function getUrgencyClass(urgency) {
    if (urgency == 1)      { return "urgency-1"; }
    else if (urgency == 2) { return "urgency-2"; }
    else if (urgency == 3) { return "urgency-3"; }
    else if (urgency == 4) { return "urgency-4"; }
    else                   { return "urgency-5"; }
}

// ── 5. AJAX POST — save new task to JSONPlaceholder REST API ───────────────
// This function demonstrates sending data to an external server using a POST request. 
// It takes a task object, converts it to JSON format, and sends it to a placeholder 
// API to simulate the process of saving data remotely.
async function postTaskToAPI(task) {
    showStatus("Saving task to server…");
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title:     task.subject,
                dateStudy: task.dateStudy,
                duration:  task.duration,
                urgency:   task.urgency
            })
        });
        const data = await response.json();
        showStatus(`✅ Task saved! (Server replied with ID: ${data.id})`);
    } catch (error) {
        showStatus("⚠️ Could not reach server: " + error.message);
    }
}

// ── 6. LO12: AJAX GET — DummyJSON SaaS REST API ───────────────────────────
//    Fetches a random quote from DummyJSON
//    No API key required — this is a free public SaaS REST API
// This function fetches data from an external API using a GET request. 
// It retrieves a random quote in JSON format, parses it, and displays 
// the quote text and author on the webpage.
async function fetchStudyQuote() {
    const quoteBox = document.querySelector("#quoteBox");
    quoteBox.textContent = "Fetching quote…";

    try {
        // AJAX GET request to DummyJSON — a free public SaaS RESTful API endpoint
        const response = await fetch("https://dummyjson.com/quotes/random");
        const data     = await response.json();   // parse JSON response

        // data.quote = the quote text, data.author = the author name
        quoteBox.textContent = `"${data.quote}" — ${data.author}`;
    } catch (error) {
        quoteBox.textContent = "⚠️ Could not load quote: " + error.message;
    }
}

// ── 7. Show a temporary status banner ─────────────────────────────────────
// This utility function displays brief notification messages to the user. 
// It makes the status banner visible, updates its text, and automatically 
// hides it again after a delay of 4000 milliseconds (4 seconds).
function showStatus(message) {
    const statusEl = document.querySelector("#statusMsg");
    statusEl.textContent = message;
    statusEl.classList.remove("d-none");
    setTimeout(function () {
        statusEl.classList.add("d-none");
    }, 4000);
}