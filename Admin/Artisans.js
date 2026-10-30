// artisans.js: search box, filter chips (All / Approved / Pending / More info /
// Rejected) and the four summary numbers on the Artisans list.
// Front-end only: it just shows and hides the rows already on the page.

var rows     = Array.prototype.slice.call(document.querySelectorAll("#artisansTable tbody tr[data-status]"));
var emptyRow = document.getElementById("emptyRow");
var chips    = document.querySelectorAll("#artisanFilters .chip");
var search   = document.getElementById("artisanSearch");
var filter   = "all";

function count(status) {
  return rows.filter(function (r) { return r.getAttribute("data-status") === status; }).length;
}

// summary cards follow the table ("Awaiting a Decision" = Pending + More info)
document.getElementById("countAll").textContent      = rows.length;
document.getElementById("countApproved").textContent = count("approved");
document.getElementById("countAwaiting").textContent = count("pending") + count("info");
document.getElementById("countRejected").textContent = count("rejected");

function applyFilters() {
  var text = search.value.trim().toLowerCase();
  var shown = 0;
  rows.forEach(function (row) {
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