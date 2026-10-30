// settings.js: Change Password flow on the Settings page.
//  - eye buttons show / hide each password
//  - the bar and the three rules update as you type the new password
//  - Update Password is enabled only when the current password is filled, all
//    three rules pass and the two new passwords match
//  - Update Password opens the "Password Updated" popup
// Front-end only: the password is NOT sent anywhere or saved yet.

function $(id) { return document.getElementById(id); }

var cur = $("curPw"), nw = $("newPw"), conf = $("confPw"), save = $("pwSave");

function openPw()  { $("pwModal").classList.add("open"); cur.focus(); }
function closePw() {
  $("pwModal").classList.remove("open");
  [cur, nw, conf].forEach(function (i) { i.value = ""; i.type = "password"; });
  document.querySelectorAll(".eye i").forEach(function (i) { i.className = "fa-regular fa-eye"; });
  refresh();
}

// ---------- show / hide ----------
document.querySelectorAll(".eye").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var input = $(btn.getAttribute("data-for"));
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("i").className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
});

// ---------- rules, bar, match ----------
function rulesFor(p) {
  return {
    len: p.length >= 8,
    mix: /[A-Z]/.test(p) && /[0-9]/.test(p),
    sym: /[^A-Za-z0-9]/.test(p)
  };
}

function refresh() {
  var p = nw.value;
  var r = rulesFor(p);
  var score = (r.len ? 1 : 0) + (r.mix ? 1 : 0) + (r.sym ? 1 : 0);

  document.querySelectorAll("#rules li").forEach(function (li) {
    li.classList.toggle("ok", r[li.getAttribute("data-rule")]);
  });

  var meter = $("meter"), label = $("meterLabel");
  meter.className = "meter" + (p ? " s" + Math.max(score, 1) : "");
  label.hidden = !p;
  label.className = "meter-label s" + Math.max(score, 1);
  label.textContent = score === 3 ? "Strong password" : score === 2 ? "Fair password" : "Weak password";

  var msg = $("matchMsg");
  var same = conf.value !== "" && conf.value === p;
  msg.hidden = conf.value === "";
  msg.className = "match " + (same ? "ok" : "no");
  msg.textContent = same ? "✓ Passwords match" : "Passwords do not match";

  save.disabled = !(cur.value && score === 3 && same);
}

[cur, nw, conf].forEach(function (i) { i.addEventListener("input", refresh); });

// ---------- open / close ----------
$("openPassword").addEventListener("click", openPw);
$("pwCancel").addEventListener("click", closePw);
$("pwModal").addEventListener("click", function (e) { if (e.target === $("pwModal")) closePw(); });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && $("pwModal").classList.contains("open")) closePw();
});

// ---------- update ----------
save.addEventListener("click", function () {
  if (save.disabled) return;
  closePw();
  $("doneModal").classList.add("open");
});
$("doneContinue").addEventListener("click", function () {
  $("doneModal").classList.remove("open");
});

refresh();