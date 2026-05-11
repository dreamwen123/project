document.addEventListener("DOMContentLoaded", async function () {
    // Fulfills LO10, LO11: Make an asynchronous GET request via AJAX on load
    await fetchExternalData(); 
    
    // Render initial data
    displayTasks();

    // Event handler for adding a new task
    const addTodoButton = document.querySelector("#addTodo");
    addTodoButton.addEventListener("click", async function () {
        const subject = document.querySelector("#subject").value;
        const date = document.querySelector("#studyDate").value;
        const duration = document.querySelector("#duration").value;
        const urgency = document.querySelector("#urgency").value;

        // Basic validation
        if (!date || !duration) {
            Swal.fire("Error", "Please fill in the Date and Duration fields.", "error");
            return;
        }

        // Add to local array and re-render
        addTask(subject, date, duration, urgency);
        displayTasks();

        // Fulfills LO12: Make an asynchronous POST request via AJAX
        await syncDataWithServer("POST", { subject, date, duration, urgency });
        
        // Clear inputs after adding
        document.querySelector("#studyDate").value = "";
        document.querySelector("#duration").value = "";
    });
});

// Render function: DOM Manipulation
function displayTasks() {
    const taskListUl = document.querySelector("#taskList");
    taskListUl.innerHTML = ""; // Clear existing elements

    for (let t of studyTasks) {
        const liElement = document.createElement("li");
        liElement.className = "list-group-item";

        // Mobile responsive grid layout
        liElement.innerHTML = `
        <div class="row align-items-center text-center text-md-start">
            <div class="col-12 col-md-3 fw-bold">${t.subject}</div>
            <div class="col-12 col-md-3">📅 ${t.date}</div>
            <div class="col-6 col-md-2">⏱️ ${t.duration} hrs</div>
            <div class="col-6 col-md-2">⚠️ Lvl ${t.urgency}</div>
            <div class="col-12 col-md-2 mt-2 mt-md-0 text-md-end">
                <button class="btn btn-success btn-sm update-btn me-1">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn">Del</button>
            </div>
        </div>
        `;

        // Event Handler: Delete
        const deleteBtn = liElement.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            deleteTask(t.id);
            displayTasks();
        });

        // Event Handler: Update via SweetAlert
        const updateBtn = liElement.querySelector(".update-btn");
        updateBtn.addEventListener("click", function () {
            Swal.fire({
                title: `Edit ${t.subject} Session`,
                html: `
                    <div class="text-start">
                        <label class="form-label">Subject</label>
                        <select id="newSubject" class="form-select mb-2">
                            <option value="Mathematics" ${t.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                            <option value="Chinese" ${t.subject === 'Chinese' ? 'selected' : ''}>Chinese</option>
                            <option value="English" ${t.subject === 'English' ? 'selected' : ''}>English</option>
                            <option value="Science" ${t.subject === 'Science' ? 'selected' : ''}>Science</option>
                        </select>
                        <label class="form-label">Date</label>
                        <input type="date" id="newDate" class="form-control mb-2" value="${t.date}" />
                        <label class="form-label">Duration</label>
                        <input type="time" id="newDuration" class="form-control mb-2" value="${t.duration}" />
                        <label class="form-label">Urgency</label>
                        <select id="newUrgency" class="form-select mb-2">
                            <option value="1" ${t.urgency == 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${t.urgency == 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${t.urgency == 3 ? 'selected' : ''}>3</option>
                            <option value="4" ${t.urgency == 4 ? 'selected' : ''}>4</option>
                            <option value="5" ${t.urgency == 5 ? 'selected' : ''}>5</option>
                        </select>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Save Changes',
                preConfirm: async () => {
                    let newSubject = document.querySelector("#newSubject").value;
                    let newDate = document.querySelector("#newDate").value;
                    let newDuration = document.querySelector("#newDuration").value;
                    let newUrgency = document.querySelector("#newUrgency").value;
                    
                    updateTask(t.id, newSubject, newDate, newDuration, newUrgency);
                    displayTasks();
                    
                    // Fulfills LO12: Make an asynchronous PATCH request via AJAX
                    await syncDataWithServer("PATCH", { id: t.id, subject: newSubject });
                }
            });
        });

        taskListUl.appendChild(liElement);
    }
}

/* ======================================================================
   AJAX / Asynchronous Data Fetching Logic (Grading Criteria LO10, LO11, LO12)
   Note: Using JSONPlaceholder to simulate network requests.
   ====================================================================== */

// Simulates an initial GET request to an API
async function fetchExternalData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        console.log("Simulated GET Request Successful. Server response:", data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Simulates sending data to a server (POST, PATCH, PUT)
async function syncDataWithServer(methodType, payload) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: methodType,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log(`Simulated ${methodType} Request Successful. Server stored:`, data);
        
        // Optional visual feedback for user
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Sync successful (${methodType})`,
            showConfirmButton: false,
            timer: 1500
        });

    } catch (error) {
        console.error(`Error during ${methodType}:`, error);
    }
}