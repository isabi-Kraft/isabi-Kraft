// disputes.js: makes the search box and the filter chips (All / Open /
// In Review / Resolved) work on the Disputes table.
// Front-end only: it just shows and hides the rows already on the page.

var rows     = Array.prototype.slice.call(document.querySelectorAll("#disputesTable tbody tr[data-status]"));
var emptyRow = document.getElementById("emptyRow");
var chips    = document.querySelectorAll("#disputeFilters .chip");
var search   = document.getElementById("disputeSearch");
var filter   = "all";

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
    chips.forEach(function (c) {
      c.classList.remove("active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");
    filter = chip.getAttribute("data-filter");
    applyFilters();
  });
});

search.addEventListener("input", applyFilters);