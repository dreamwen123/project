const JSONBIN_API_URL="https://api.jsonbin.io/v3";
const JSONBIN_ID="6a017b5cadc21f119a81b087";
const MASTER_KEY="$2a$10$7NeRx7aMaSVSXSvSF9euW.KEIWPGGCZc/oUh2nldS5qSJhq7lmVq.";

// use `let` so that we re-assign to it
let tasks = []

function deleteTask(tasks, idToDelete) {

    // goal: given id, find its index number
    let i = 0;
    let wantedIndex = -1;  // -1 does not found
    while (i < tasks.length) {

        if (tasks[i].id == idToDelete) {
            wantedIndex = i;
            break;
        }

        i = i + 1;
    }

    // if wantedIndex is not -1, then we have the found index to delete
    if (wantedIndex != -1) {
        tasks.splice(wantedIndex, 1);
    }
}

function updateTask(tasks, idToUpdate, newName, newDateDue, newUrgency) {
    let modifiedTask = {
        id: idToUpdate,
        name: newName,
        dateDue: newDateDue,
        urgency: newUrgency
    }

    let indexToUpdate = -1;
    let i = 0;
    while (i < tasks.length) {
        if (tasks[i].id == idToUpdate) {
            indexToUpdate = i;
            break;
        }
        i = i + 1;
    }

    if (indexToUpdate != -1) {
        tasks[indexToUpdate] = modifiedTask;
    }
}

async function loadTasks() {
    const url = `${JSONBIN_API_URL}/b/${JSONBIN_ID}/latest`;
    const response = await axios.get(url);
    return response.data.record;
}

async function saveTasks(tasks) {
    const response = await axios.put(`${JSONBIN_API_URL}/b/${JSONBIN_ID}`, tasks, {
        headers: {
            "Content-Type":"application/json",
            "X-Master-Key": MASTER_KEY
        }
    })
    return response.data;
}
// ── Global study tasks array ──────────────────────────────────────────────────
// const tasks = [
//     {
//         id: 1,
//         subject: "Mathematics",
//         dateStudy: "2026-05-15",   // stored as yyyy-mm-dd internally
//         duration: "02:00",
//         urgency: 5
//     },
//     {
//         id: 2,
//         subject: "Chinese",
//         dateStudy: "2026-05-16",
//         duration: "01:30",
//         urgency: 3
//     },
//     {
//         id: 3,
//         subject: "English",
//         dateStudy: "2026-05-17",
//         duration: "01:00",
//         urgency: 2
//     },
//     {
//         id: 4,
//         subject: "Science",
//         dateStudy: "2026-05-18",
//         duration: "00:45",
//         urgency: 4
//     }
// ];

// ── Helper: convert yyyy-mm-dd  →  mm/dd/yyyy for display ────────────────────
function formatDate(dateStr) {
    // dateStr is "yyyy-mm-dd"
    const parts = dateStr.split("-");   // ["yyyy", "mm", "dd"]
    if (parts.length !== 3) return dateStr;
    return parts[1] + "/" + parts[2] + "/" + parts[0];   // mm/dd/yyyy
}

// ── CREATE ────────────────────────────────────────────────────────────────────
function addTask(tasks, newSubject, newDateStudy, newDuration, newUrgency) {
    const newTask = {
        id: Math.floor(Math.random() * 10000) + 1,
        subject: newSubject,
        dateStudy: newDateStudy,
        duration: newDuration,
        urgency: Number(newUrgency)
    };
    tasks.push(newTask);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
function deleteTask(tasks, idToDelete) {
    let wantedIndex = -1;
    let i = 0;
    while (i < tasks.length) {
        if (tasks[i].id == idToDelete) {
            wantedIndex = i;
            break;
        }
        i = i + 1;
    }
    if (wantedIndex != -1) {
        tasks.splice(wantedIndex, 1);
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
function updateTask(tasks, idToUpdate, newSubject, newDateStudy, newDuration, newUrgency) {
    const modifiedTask = {
        id: idToUpdate,
        subject: newSubject,
        dateStudy: newDateStudy,
        duration: newDuration,
        urgency: Number(newUrgency)
    };

    let indexToUpdate = -1;
    let i = 0;
    while (i < tasks.length) {
        if (tasks[i].id == idToUpdate) {
            indexToUpdate = i;
            break;
        }
        i = i + 1;
    }

    if (indexToUpdate != -1) {
        tasks[indexToUpdate] = modifiedTask;
    }
}