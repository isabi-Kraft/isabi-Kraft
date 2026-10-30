// logout.js: makes every "Admin Logout" link (class "logout") open a
// "Log out of iSabiKraft Admin?" popup. Cancel closes it; Log out clears
// the saved page data and goes to LoggedOut.html.
// Add to a page:  <link rel="stylesheet" href="LogoutModal.css">  and
//                 <script src="logout.js"></script>  (before </body>)
(function () {
    var links = document.querySelectorAll("a.logout");
    if (!links.length) return;
  
    var overlay = document.createElement("div");
    overlay.className = "lo-overlay";
    overlay.innerHTML =
      '<div class="lo-modal" role="dialog" aria-modal="true" aria-labelledby="loTitle">' +
        '<span class="lo-icon"><i class="fa-solid fa-right-from-bracket"></i></span>' +
        '<h2 id="loTitle">Log out of iSabiKraft Admin?</h2>' +
        '<p>You will need to log in again to open the dashboard. Save any changes before you log out.</p>' +
        '<div class="lo-buttons">' +
          '<button type="button" class="lo-cancel">Cancel</button>' +
          '<button type="button" class="lo-confirm">Log out</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  
    function openIt()  { overlay.classList.add("open"); overlay.querySelector(".lo-cancel").focus(); }
    function closeIt() { overlay.classList.remove("open"); }
  
    links.forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); openIt(); });
    });
  
    overlay.querySelector(".lo-cancel").addEventListener("click", closeIt);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeIt(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeIt(); });
  
    overlay.querySelector(".lo-confirm").addEventListener("click", function () {
      try {
        Object.keys(sessionStorage).forEach(function (k) {
          if (k.indexOf("isabikraft.") === 0) sessionStorage.removeItem(k);
        });
      } catch (err) {}
      window.location.href = "LoggedOut.html";
    });
  })();