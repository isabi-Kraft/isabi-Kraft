// alljobs.js: makes the search box and the filter chips (All / Active /
// Completed / Cancelled / Needs attention) work on the All Jobs table.
// Front-end only: it just shows and hides the rows that are already on the page.

var rows     = Array.prototype.slice.call(document.querySelectorAll("#jobsTable tbody tr[data-status]"));
var emptyRow = document.getElementById("emptyRow");
var chips    = document.querySelectorAll("#jobFilters .chip");
var search   = document.getElementById("jobSearch");
var filter   = "all";

function matchesFilter(row) {
  if (filter === "all") return true;
  if (filter === "attention") return row.getAttribute("data-attention") === "yes";
  return row.getAttribute("data-status") === filter;
}

function applyFilters() {
  var text = search.value.trim().toLowerCase();
  var shown = 0;

  rows.forEach(function (row) {
    var ok = matchesFilter(row) && (text === "" || row.textContent.toLowerCase().indexOf(text) !== -1);
    row.hidden = !ok;
    if (ok) shown++;
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
