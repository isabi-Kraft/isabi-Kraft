// disputedetail.js: the dispute flow on DisputeDetail.html.
// Front-end only for now: the page changes on screen but nothing is saved,
// so refreshing the page resets it.
//
// Flow:
//   Open        -> type a note -> "Save note and move to In Review"
//   In Review   -> more notes can be added, or "Resolve Dispute" opens a popup
//   Resolve     -> pick an action + write a note -> Resolve Dispute
//   Resolved    -> the case is closed and cannot be changed

var ADMIN = "Chidinma";

var statusPill   = document.getElementById("disputeStatus");
var noteBox      = document.getElementById("noteBox");
var saveNote     = document.getElementById("saveNote");
var stateNote    = document.getElementById("stateNote");
var openResolve  = document.getElementById("openResolve");
var noteArea     = document.getElementById("noteArea");
var resolutionBox  = document.getElementById("resolutionBox");
var resolutionText = document.getElementById("resolutionText");
var caseClosed   = document.getElementById("caseClosed");
var toast        = document.getElementById("toast");
var notesList    = document.getElementById("notesList");
var noNotes      = document.getElementById("noNotes");
var activityList = document.getElementById("activityList");

var resolveModal = document.getElementById("resolveModal");
var actionTaken  = document.getElementById("actionTaken");
var resolutionNote = document.getElementById("resolutionNote");
var resolveSave  = document.getElementById("resolveSave");

var state = "open";            // open | review | resolved

// ---------- helpers ----------
function two(n) { return (n < 10 ? "0" : "") + n; }
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function stamp() {
  var d = new Date();
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " + two(d.getHours()) + ":" + two(d.getMinutes());
}

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
}

function setStatus(label, cls) {
  statusPill.textContent = label;
  statusPill.className = "pill " + cls;
}

function addActivity(title) {
  var old = activityList.querySelector(".latest");
  if (old) old.classList.remove("latest");
  var li = document.createElement("li");
  li.className = "latest";
  var strong = document.createElement("strong");
  strong.textContent = title;
  var span = document.createElement("span");
  span.className = "muted";
  span.textContent = stamp();
  li.appendChild(strong);
  li.appendChild(span);
  activityList.insertBefore(li, activityList.firstChild);
}

function addNote(text, when) {
  noNotes.hidden = true;
  var wrap = document.createElement("div");
  wrap.className = "note";
  var meta = document.createElement("span");
  meta.className = "note-meta";
  meta.textContent = ADMIN + ", " + when;
  var body = document.createElement("p");
  body.className = "note-text";
  body.textContent = text;
  wrap.appendChild(meta);
  wrap.appendChild(body);
  notesList.appendChild(wrap);
}

// ---------- 1. The note box and its button ----------
// While Open the button reads "Save note and move to In Review".
// While In Review it reads "Saved Note" (faded) until a new note is typed.
function refreshNoteButton() {
  var hasText = noteBox.value.trim() !== "";
  saveNote.disabled = !hasText;
  if (state === "open") {
    saveNote.textContent = "Save note and move to In Review";
  } else {
    saveNote.textContent = hasText ? "Save note" : "Saved Note";
  }
}
noteBox.addEventListener("input", refreshNoteButton);

saveNote.addEventListener("click", function () {
  var text = noteBox.value.trim();
  if (text === "") return;
  addNote(text, stamp());
  noteBox.value = "";

  if (state === "open") {
    state = "review";
    setStatus("In Review", "review");
    addActivity("Moved to In Review by " + ADMIN);
    stateNote.hidden = true;
    openResolve.hidden = false;
    showToast("Note saved. Dispute is In Review.");
  } else {
    showToast("Note saved.");
  }
  refreshNoteButton();
});

// ---------- 2. Resolve popup ----------
openResolve.addEventListener("click", function () {
  resolveModal.classList.add("open");
  actionTaken.focus();
});

function checkResolveForm() {
  resolveSave.disabled = !(actionTaken.value !== "" && resolutionNote.value.trim() !== "");
}
actionTaken.addEventListener("change", checkResolveForm);
resolutionNote.addEventListener("input", checkResolveForm);

// Cancel / X / dark background / Escape close it and clear it
function closeResolve() {
  resolveModal.classList.remove("open");
  actionTaken.selectedIndex = 0;
  resolutionNote.value = "";
  checkResolveForm();
}
document.getElementById("resolveCancel").addEventListener("click", closeResolve);
document.getElementById("resolveClose").addEventListener("click", closeResolve);
resolveModal.addEventListener("click", function (e) {
  if (e.target === resolveModal) closeResolve();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && resolveModal.classList.contains("open")) closeResolve();
});

// ---------- 3. Resolve: close the case ----------
resolveSave.addEventListener("click", function () {
  if (resolveSave.disabled) return;
  var action = actionTaken.value;
  var note   = resolutionNote.value.trim();

  state = "resolved";
  setStatus("Resolved", "resolved");
  noteArea.hidden = true;
  openResolve.hidden = true;
  resolutionText.textContent = "Action: " + action + ". Note: " + note;
  resolutionBox.hidden = false;
  caseClosed.hidden = false;
  addActivity("Resolved by " + ADMIN);
  showToast("Dispute resolved. Both parties have been notified.");

  resolveModal.classList.remove("open");
  actionTaken.selectedIndex = 0;
  resolutionNote.value = "";
  checkResolveForm();
});

refreshNoteButton();
checkResolveForm();