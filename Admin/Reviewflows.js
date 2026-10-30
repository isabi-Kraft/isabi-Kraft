// ReviewFlows.js: the "Reject Artisan" and "Request More Information" flows.
// It sits NEXT TO ArtisanReview.js (your Approve flow) and does not change it.
//
// Load it on three pages, after everything else:
//   ArtisanReview.html         -> panels, form popups, success popups
//   ArtisanRejected.html       -> fills the page with the reason and note typed
//   ArtisanInfoRequested.html  -> fills the page with what was asked for
//
// Front-end only for now: the decision is passed between pages with
// sessionStorage, so nothing is saved on a server and a new tab starts fresh.
// Every part checks that its elements exist first, so a missing id can never
// throw an error that stops the other flows.

(function () {
    var REJECT_KEY = "isabikraft.rejection";
    var INFO_KEY   = "isabikraft.inforequest";
  
    function save(key, data) {
      try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }
    function load(key) {
      try { return JSON.parse(sessionStorage.getItem(key)); } catch (e) { return null; }
    }
    function stamp() {
      var d = new Date();
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes());
    }
    function artisanName() {
      var el = document.querySelector(".summary h2");
      return el ? el.textContent.trim() : "The artisan";
    }
    function setText(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    }
  
    /* ========== Admin Actions: only one panel open at a time ========== */
    var approveOption = document.getElementById("approveOption");
    var rejectOption  = document.getElementById("rejectOption");
    var infoOption    = document.getElementById("infoOption");
    var panels = [approveOption, rejectOption, infoOption].filter(Boolean);
  
    function closeOthers(keep) {
      panels.forEach(function (p) { if (p !== keep) p.classList.remove("open"); });
    }
  
    // Approve is toggled by ArtisanReview.js. This listener runs after it
    // and just closes the other two panels when Approve has opened.
    var approveToggle = document.getElementById("approveToggle");
    if (approveToggle && approveOption) {
      approveToggle.addEventListener("click", function () {
        if (approveOption.classList.contains("open")) closeOthers(approveOption);
      });
    }
  
    /* ========== REJECT: ArtisanReview.html ========== */
    if (rejectOption) {
      var rejectModal = document.getElementById("rejectModal");
      var rejectDone  = document.getElementById("rejectDoneModal");
      var reason      = document.getElementById("rejectReason");
      var note        = document.getElementById("rejectNote");
      var submitBtn   = document.getElementById("rejectSubmit");
  
      // 1. "Reject Artisan" in Admin Actions opens/closes its panel
      document.getElementById("rejectToggle").addEventListener("click", function () {
        rejectOption.classList.toggle("open");
        if (rejectOption.classList.contains("open")) closeOthers(rejectOption);
      });
  
      // 2. The button inside the panel opens the form popup
      document.getElementById("rejectBtn").addEventListener("click", function () {
        rejectModal.classList.add("open");
        reason.focus();
      });
  
      // 3. "Reject Artisan" stays faded and unclickable until a reason AND a note exist
      function checkReject() {
        submitBtn.disabled = !(reason.value !== "" && note.value.trim() !== "");
      }
      reason.addEventListener("change", checkReject);
      note.addEventListener("input", checkReject);
  
      // 4. Cancel / X / dark background / Escape close the form popup and clear it
      function closeReject() {
        rejectModal.classList.remove("open");
        reason.selectedIndex = 0;
        note.value = "";
        checkReject();
      }
      document.getElementById("rejectCancel").addEventListener("click", closeReject);
      document.getElementById("rejectClose").addEventListener("click", closeReject);
      rejectModal.addEventListener("click", function (e) {
        if (e.target === rejectModal) closeReject();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && rejectModal.classList.contains("open")) closeReject();
      });
  
      // 5. "Reject Artisan" in the popup records the decision and opens the success popup
      submitBtn.addEventListener("click", function () {
        if (submitBtn.disabled) return;
        save(REJECT_KEY, {
          name:   artisanName(),
          reason: reason.options[reason.selectedIndex].text,
          note:   note.value.trim(),
          when:   stamp()
        });
        rejectModal.classList.remove("open");
        rejectDone.classList.add("open");
      });
  
      // 6. "Continue" opens the Rejected version of the page
      document.getElementById("rejectContinue").addEventListener("click", function () {
        window.location.href = "ArtisanRejected.html";
      });
    }
  
    /* ========== REQUEST MORE INFORMATION: ArtisanReview.html ========== */
    if (infoOption) {
      var infoModal  = document.getElementById("infoModal");
      var infoDone   = document.getElementById("infoDoneModal");
      var infoMsg    = document.getElementById("infoMessage");
      var infoSubmit = document.getElementById("infoSubmit");
      var boxes      = Array.prototype.slice.call(infoModal.querySelectorAll('input[type="checkbox"]'));
      var typedByAdmin = false;   // once the admin types their own message, stop auto-filling it
  
      // 1. "Request More Information" in Admin Actions opens/closes its panel
      document.getElementById("infoToggle").addEventListener("click", function () {
        infoOption.classList.toggle("open");
        if (infoOption.classList.contains("open")) closeOthers(infoOption);
      });
  
      // 2. The button inside the panel opens the form popup
      document.getElementById("infoBtn").addEventListener("click", function () {
        infoModal.classList.add("open");
      });
  
      // 3. "Send Request" stays faded until at least one box is ticked AND there is a message
      function checkInfo() {
        var anyTicked = boxes.some(function (b) { return b.checked; });
        infoSubmit.disabled = !(anyTicked && infoMsg.value.trim() !== "");
      }
  
      // Ticking a box writes a starter message (the admin can edit it freely)
      function fillMessage() {
        if (typedByAdmin && infoMsg.value.trim() !== "") return;
        var hints = [];
        boxes.forEach(function (b) { if (b.checked) hints.push(b.getAttribute("data-hint")); });
        infoMsg.value = hints.join("; ");
        typedByAdmin = false;
      }
      boxes.forEach(function (b) {
        b.addEventListener("change", function () { fillMessage(); checkInfo(); });
      });
      infoMsg.addEventListener("input", function () { typedByAdmin = true; checkInfo(); });
  
      // 4. Cancel / X / dark background / Escape close the form popup and clear it
      function closeInfo() {
        infoModal.classList.remove("open");
        boxes.forEach(function (b) { b.checked = false; });
        infoMsg.value = "";
        typedByAdmin = false;
        checkInfo();
      }
      document.getElementById("infoCancel").addEventListener("click", closeInfo);
      document.getElementById("infoClose").addEventListener("click", closeInfo);
      infoModal.addEventListener("click", function (e) {
        if (e.target === infoModal) closeInfo();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && infoModal.classList.contains("open")) closeInfo();
      });
  
      // 5. "Send Request" records the request and opens the success popup
      infoSubmit.addEventListener("click", function () {
        if (infoSubmit.disabled) return;
        save(INFO_KEY, {
          name:    artisanName(),
          message: infoMsg.value.trim(),
          when:    stamp()
        });
        infoModal.classList.remove("open");
        infoDone.classList.add("open");
      });
  
      // 6. "Continue" opens the Information Requested version of the page
      document.getElementById("infoContinue").addEventListener("click", function () {
        window.location.href = "ArtisanInfoRequested.html";
      });
  
      checkInfo();
    }
  
    /* ========== ArtisanRejected.html ========== */
    if (document.getElementById("rDecision")) {
      var r = load(REJECT_KEY);
      if (r) {
        setText("rName", r.name);
        setText("rToast", "Flagged-off. " + r.reason);
        setText("rDecision", "Reason: " + r.reason + ". Note: " + r.note + " " + r.when + ".");
        setText("rWhen", r.when);
      }
      // no saved decision (page opened directly): the sample text in the HTML stays
    }
  
    /* ========== ArtisanInfoRequested.html ========== */
    if (document.getElementById("iDecision")) {
      var q = load(INFO_KEY);
      if (q) {
        var first = q.name.split(" ")[0];
        var missing = q.message.replace(/[.\s]+$/, "");
        setText("iName", q.name);
        setText("iToast", "Request sent. Waiting for " + first + " to resubmit.");
        setText("iDecision", "Missing: " + missing + ". Sent " + q.when + ". Waiting for " + first + " to resubmit.");
        setText("iWhen", q.when);
      }
    }
  })();