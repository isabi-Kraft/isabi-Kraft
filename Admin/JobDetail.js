// jobdetail.js: the "Record admin update" flow on JobDetail.html.
// Front-end only for now: the page changes on screen but nothing is saved,
// so refreshing the page resets it.
//
// Flow: "Record admin update" -> form popup -> "Job Updated" popup -> Continue
// -> the page itself shows the new status and a new change-log entry.

var JOB_ID = "JK-00124";
var ADMIN  = "Chidinma";

var updateModal = document.getElementById("updateModal");
var doneModal   = document.getElementById("doneModal");
var changeType  = document.getElementById("changeType");
var dateField   = document.getElementById("dateField");
var newDate     = document.getElementById("newDate");
var reasonBox   = document.getElementById("changeReason");
var saveBtn     = document.getElementById("updateSave");

// What was just saved (used again when Continue is pressed)
var pending = null;

// ---------- small helpers ----------
function two(n) { return (n < 10 ? "0" : "") + n; }
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// 18 Oct 2026, 11:20
function stamp(d) {
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " + two(d.getHours()) + ":" + two(d.getMinutes());
}
// 20 Oct 2026, 10:00 am
function niceDate(d) {
  var h = d.getHours();
  var ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " + h + ":" + two(d.getMinutes()) + " " + ampm;
}

// ---------- 1. Open the form ----------
document.getElementById("openUpdate").addEventListener("click", function () {
  updateModal.classList.add("open");
  changeType.focus();
});

// ---------- 2. "Save Update" stays off until the form is complete ----------
function checkForm() {
  var ready = changeType.value !== "" && reasonBox.value.trim() !== "";
  if (changeType.value === "date" && newDate.value === "") ready = false;
  saveBtn.disabled = !ready;
}
changeType.addEventListener("change", function () {
  dateField.hidden = changeType.value !== "date";
  reasonBox.placeholder = "Explain the decision and what happens next";
  checkForm();
});
newDate.addEventListener("input", checkForm);
reasonBox.addEventListener("input", checkForm);

// ---------- 3. Cancel / X / dark background / Escape close it and clear it ----------
function closeForm() {
  updateModal.classList.remove("open");
  changeType.selectedIndex = 0;
  dateField.hidden = true;
  newDate.value = "";
  reasonBox.value = "";
  reasonBox.placeholder = "Explain why you are making this change";
  checkForm();
}
document.getElementById("updateCancel").addEventListener("click", closeForm);
document.getElementById("updateClose").addEventListener("click", closeForm);
updateModal.addEventListener("click", function (e) {
  if (e.target === updateModal) closeForm();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && updateModal.classList.contains("open")) closeForm();
});

// ---------- 4. Save: remember what was chosen and show the "Job Updated" popup ----------
saveBtn.addEventListener("click", function () {
  if (saveBtn.disabled) return;

  var kind   = changeType.value;
  var reason = reasonBox.value.trim();
  var doneText = document.getElementById("doneText");
  var doneTag  = document.getElementById("doneTag");

  pending = { kind: kind, reason: reason, when: stamp(new Date()) };

  if (kind === "completed") {
    doneText.textContent = JOB_ID + " is now Completed";
    doneTag.textContent = "Completed";
    doneTag.className = "tag completed outline";
  } else if (kind === "cancelled") {
    doneText.textContent = JOB_ID + " is now Cancelled";
    doneTag.textContent = "Cancelled";
    doneTag.className = "tag cancelled outline";
  } else {
    pending.newDate = niceDate(new Date(newDate.value));
    pending.oldDate = document.getElementById("jobWhen").textContent;
    doneText.textContent = JOB_ID + " has a new date and time";
    doneTag.textContent = "Rescheduled";
    doneTag.className = "tag active outline";
  }

  updateModal.classList.remove("open");
  doneModal.classList.add("open");
});

// ---------- 5. Continue: update the page itself ----------
function addLogEntry(title, detail) {
  var list = document.getElementById("changeLog");
  var old = list.querySelector(".latest");
  if (old) old.classList.remove("latest");

  var li = document.createElement("li");
  li.className = "latest";
  var strong = document.createElement("strong");
  strong.textContent = title;
  var span = document.createElement("span");
  span.className = "muted";
  span.textContent = detail;
  li.appendChild(strong);
  li.appendChild(span);
  list.insertBefore(li, list.firstChild);
}

document.getElementById("doneContinue").addEventListener("click", function () {
  doneModal.classList.remove("open");
  if (!pending) return;

  var statusTag  = document.getElementById("jobStatus");
  var statusNote = document.getElementById("statusNote");
  var button     = document.getElementById("openUpdate");

  if (pending.kind === "completed" || pending.kind === "cancelled") {
    var word = pending.kind === "completed" ? "Completed" : "Cancelled";
    statusTag.textContent = word;
    statusTag.className = "tag " + pending.kind;
    button.hidden = true;                                 // a closed job cannot be changed again
    statusNote.textContent = "This job is " + pending.kind + ". Closed jobs cannot be changed.";
    addLogEntry("Marked as " + word + " by " + ADMIN, pending.when + ". Reason: " + pending.reason);
  } else {
    document.getElementById("jobWhen").textContent = pending.newDate;
    addLogEntry("Date and time changed by " + ADMIN, pending.when + ". From " + pending.oldDate + " to " + pending.newDate + ". Reason: " + pending.reason);
  }

  // clear the form for next time
  changeType.selectedIndex = 0;
  dateField.hidden = true;
  newDate.value = "";
  reasonBox.value = "";
  reasonBox.placeholder = "Explain why you are making this change";
  checkForm();
  pending = null;
});

checkForm();