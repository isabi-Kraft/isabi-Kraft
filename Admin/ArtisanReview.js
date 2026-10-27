// review.js: runs the "Approve Artisan" flow on review.html.
// Front-end only for now: nothing is saved, so refreshing the page resets it.

// 1. Grab the parts of the page we need to control
const approveOption = document.getElementById("approveOption");
const confirmModal  = document.getElementById("confirmModal");
const successModal  = document.getElementById("successModal");

// 2. Clicking "Approve Artisan" in Admin Actions opens or closes its small panel
document.getElementById("approveToggle").addEventListener("click", function () {
  approveOption.classList.toggle("open");
});

// 3. The button inside the panel opens the "Approve Artisan?" popup
document.getElementById("approveBtn").addEventListener("click", function () {
  confirmModal.classList.add("open");
});

// 4. Cancel and the X close that popup
function closeConfirm() {
  confirmModal.classList.remove("open");
}
document.getElementById("cancelBtn").addEventListener("click", closeConfirm);
document.getElementById("confirmClose").addEventListener("click", closeConfirm);

// 5. "Confirm Approval" closes the first popup and opens the success popup
document.getElementById("confirmBtn").addEventListener("click", function () {
  closeConfirm();
  successModal.classList.add("open");
});

// 6. The X on the success popup opens the "Approved" version of the page.
//    (The "Back to Verification Queue" button is a normal link to index.html.)
document.getElementById("successClose").addEventListener("click", function () {
  window.location.href = "ArtisanApproved.html";
});

// 7. Pressing Escape closes the "Are you sure?" popup
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeConfirm();
  }
});