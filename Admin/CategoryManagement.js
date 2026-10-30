// categories.js: Category Management page.
//  - search box and All / Active / Inactive chips filter the table
//  - Add Category and Edit open a form popup, then a success popup
//  - Activate / Deactivate ask "are you sure?", then show a success popup
//  - the three summary numbers follow the table
// Front-end only for now: nothing is saved, so refreshing the page resets it.

var tbody    = document.querySelector("#categoriesTable tbody");
var emptyRow = document.getElementById("emptyRow");
var chips    = document.querySelectorAll("#categoryFilters .chip");
var search   = document.getElementById("categorySearch");
var filter   = "all";

function getRows() {
  return Array.prototype.slice.call(tbody.querySelectorAll("tr[data-status]"));
}

// ---------- filters + search ----------
function applyFilters() {
  var text = search.value.trim().toLowerCase();
  var shown = 0;
  getRows().forEach(function (row) {
    var statusOk = filter === "all" || row.getAttribute("data-status") === filter;
    var textOk   = text === "" || row.textContent.toLowerCase().indexOf(text) !== -1;
    row.hidden = !(statusOk && textOk);
    if (!row.hidden) shown++;
  });
  emptyRow.hidden = shown !== 0;
}

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    chips.forEach(function (c) { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");
    filter = chip.getAttribute("data-filter");
    applyFilters();
  });
});
search.addEventListener("input", applyFilters);

// ---------- summary numbers ----------
function updateCounts() {
  var rows = getRows();
  var active = rows.filter(function (r) { return r.getAttribute("data-status") === "active"; }).length;
  document.getElementById("countAll").textContent      = rows.length;
  document.getElementById("countActive").textContent   = active;
  document.getElementById("countInactive").textContent = rows.length - active;
}

// ---------- small helpers ----------
function $(id) { return document.getElementById(id); }
function open(id)  { $(id).classList.add("open"); }
function close(id) { $(id).classList.remove("open"); }
function rowName(row) { return row.children[1].textContent; }
function rowId(row)   { return row.children[0].textContent; }

function nameTaken(name, exceptRow) {
  return getRows().some(function (r) {
    return r !== exceptRow && rowName(r).trim().toLowerCase() === name.trim().toLowerCase();
  });
}

function nextId() {
  var max = 0;
  getRows().forEach(function (r) {
    var n = parseInt(rowId(r).replace(/\D/g, ""), 10);
    if (n > max) max = n;
  });
  return "JK-" + String(max + 1).padStart(5, "0");
}

function buildRow(id, name) {
  var tr = document.createElement("tr");
  tr.setAttribute("data-status", "active");
  tr.innerHTML =
    '<td class="c-id"></td><td></td>' +
    '<td><span class="pill active">Active</span></td>' +
    '<td class="actions"><button type="button" class="row-btn edit">Edit</button>' +
    '<button type="button" class="row-btn toggle">Deactivate</button></td>';
  tr.children[0].textContent = id;
  tr.children[1].textContent = name;
  return tr;
}

function setRowStatus(row, status) {
  var on = status === "active";
  row.setAttribute("data-status", status);
  var pill = row.querySelector(".pill");
  pill.textContent = on ? "Active" : "Inactive";
  pill.className   = "pill " + (on ? "active" : "inactive");
  row.querySelector(".toggle").textContent = on ? "Deactivate" : "Activate";
}

// ---------- success popup ----------
var afterDone = null;   // what to do when Continue is pressed

function showDone(title, text, status, lines, apply) {
  $("doneTitle").textContent = title;
  $("doneText").textContent  = text;
  var pill = $("donePill");
  pill.textContent = status === "active" ? "Active" : "Inactive";
  pill.className   = "pill " + status;
  $("doneList").innerHTML = "";
  lines.forEach(function (l) {
    var li = document.createElement("li");
    li.textContent = l;
    $("doneList").appendChild(li);
  });
  afterDone = apply;
  open("doneModal");
}

$("doneContinue").addEventListener("click", function () {
  close("doneModal");
  if (afterDone) afterDone();
  afterDone = null;
  updateCounts();
  applyFilters();
});

// ---------- Add / Edit form popup ----------
var formMode = "add";     // "add" or "edit"
var formRow  = null;      // the row being edited

function formState() {
  var value = $("categoryName").value.trim();
  var field = $("categoryName").parentNode;
  var hint  = $("formHint");
  var problem = "";

  if (value && nameTaken(value, formMode === "edit" ? formRow : null)) problem = "A category called “" + value + "” already exists.";

  field.classList.toggle("error", !!problem);
  hint.classList.toggle("error", !!problem);
  hint.textContent = problem || "Customers see this name when they post a job.";

  var changed = formMode === "add" || value !== rowName(formRow);
  $("formSave").disabled = !(value && changed && !problem);
}

function openForm(mode, row) {
  formMode = mode;
  formRow  = row || null;
  if (mode === "add") {
    $("formTitle").textContent = "Add Category";
    $("formText").textContent  = "New categories are active right away.";
    $("formSave").textContent  = "Add Category";
    $("categoryName").value    = "";
  } else {
    $("formTitle").textContent = "Edit Category";
    $("formText").textContent  = "Change the name customers see. ID: " + rowId(row) + ".";
    $("formSave").textContent  = "Save Changes";
    $("categoryName").value    = rowName(row);
  }
  formState();
  open("formModal");
  $("categoryName").focus();
}

function closeForm() { close("formModal"); formRow = null; }

$("addCategory").addEventListener("click", function () { openForm("add"); });
$("categoryName").addEventListener("input", formState);
$("formCancel").addEventListener("click", closeForm);
$("formClose").addEventListener("click", closeForm);

$("formSave").addEventListener("click", function () {
  var name = $("categoryName").value.trim();
  if ($("formSave").disabled || !name) return;

  if (formMode === "add") {
    closeForm();
    showDone("Category Added",
      "“" + name + "” is now available to customers when they post a job.",
      "active",
      ["Customers can select it for new jobs.", "You can edit or deactivate it any time.", "This change is saved in the activity history."],
      function () { tbody.insertBefore(buildRow(nextId(), name), emptyRow); });
  } else {
    var row = formRow;
    var status = row.getAttribute("data-status");
    closeForm();
    showDone("Category Updated",
      "The category is now called “" + name + "”.",
      status,
      ["Customers will see the new name on the new jobs.", "Existing jobs keep their category.", "This change is saved in the activity history."],
      function () { row.children[1].textContent = name; });
  }
});

// ---------- Activate / Deactivate ----------
var confirmRow = null;

function openConfirm(row) {
  confirmRow = row;
  var name = rowName(row);
  var deactivating = row.getAttribute("data-status") === "active";
  $("confirmTitle").textContent = (deactivating ? "Deactivate " : "Activate ") + name + "?";
  $("confirmText").textContent  = deactivating
    ? "Customers will no longer be able to pick this category for new jobs. Existing jobs are not affected."
    : "Customers will be able to pick this category for the jobs again.";
  $("confirmOk").textContent = deactivating ? "Deactivate" : "Activate";
  $("confirmOk").classList.toggle("danger", deactivating);
  open("confirmModal");
}

function closeConfirm() { close("confirmModal"); confirmRow = null; }
$("confirmCancel").addEventListener("click", closeConfirm);

$("confirmOk").addEventListener("click", function () {
  var row = confirmRow;
  if (!row) return;
  var name = rowName(row);
  var deactivating = row.getAttribute("data-status") === "active";
  closeConfirm();

  if (deactivating) {
    showDone("Category Deactivated",
      "“" + name + "” is hidden from customers.",
      "inactive",
      ["Customers can no longer select it for new jobs.", "Existing jobs keep their category.", "You can activate it again any time."],
      function () { setRowStatus(row, "inactive"); });
  } else {
    showDone("Category Activated",
      "“" + name + "” can be selected by customers again.",
      "active",
      ["Customers can select it for new jobs.", "You can deactivate it any time.", "This change is saved in the activity history."],
      function () { setRowStatus(row, "active"); });
  }
});

// ---------- row buttons (one listener works for added rows too) ----------
tbody.addEventListener("click", function (e) {
  var btn = e.target.closest(".row-btn");
  if (!btn) return;
  var row = btn.closest("tr");
  if (btn.classList.contains("edit")) openForm("edit", row);
  else openConfirm(row);
});

// ---------- close popups: click outside or Escape (not the success popup) ----------
["formModal", "confirmModal"].forEach(function (id) {
  $(id).addEventListener("click", function (e) {
    if (e.target === $(id)) { id === "formModal" ? closeForm() : closeConfirm(); }
  });
});
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("formModal").classList.contains("open")) closeForm();
  else if ($("confirmModal").classList.contains("open")) closeConfirm();
});
$("categoryName").addEventListener("keydown", function (e) {
  if (e.key === "Enter") $("formSave").click();
});

updateCounts();