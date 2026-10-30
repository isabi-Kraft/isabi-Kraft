// artisandetail.js: fills the artisan detail page for the id in the address,
// e.g. ArtisanDetail.html?id=ART-0001. Front-end only: sample data below.
// Photos: rename the files in the PHOTOS block to match your Images folder.

var PHOTOS = {
    profile:   "Images/Tunde.jpg",
    ninFront:  "Images/NIN Front.png",
    ninBack:   "Images/NIN Back.png",
    selfie:    "Images/Selfie.png",
    portfolio: [
      { src: "Images/Camp image.png", tag: "" },
      { src: "Images/Media.png",  },
      { src: "Images/Images.png",  },
      { src: "Images/portofolio image.png",  },
      { src: "Images/Images-2.png",  }
    ]
  };
  
  var STATUS = {
    approved: "Approved",
    pending:  "Pending",
    info:     "More Information Required",
    rejected: "Rejected"
  };
  
  var SKILLS = ["Wiring", "Breakers", "Lighting", "Fan installation"];
  
  var ARTISANS = {
    "ART-0001": {
      name: "Tunde Adeyemi", trade: "Electrical", area: "Lekki, Lagos", email: "tunde@example.com",
      status: "approved", record: "Approved by Chidinma on 20 Oct 2026.", skills: SKILLS,
      jobs: [
        { id: "JK-00124", link: "JobDetail.html", cat: "Electrical", customer: "Chidinma Okafor", price: "\u20A625,000", date: "23 Oct 2026", st: "Active" },
        { id: "JK-1019",  link: "",               cat: "Electrical", customer: "Chika Nwosu",     price: "\u20A665,000", date: "22 Oct 2026", st: "Completed" }
      ],
      disputes: [
        { id: "DSP-0007", link: "DisputeDetail.html", job: "JK-00124", issue: "Work left incomplete",   st: "Open" },
        { id: "DSP-0003", link: "",                   job: "JK-1019",  issue: "Materials not as agreed", st: "In Review" }
      ]
    },
    "ART-0007": {
      name: "Ibrahim Lawal", trade: "Painter", area: "Lekki, Lagos", email: "lawal@example.com",
      status: "pending", record: "Awaiting a decision. Submitted 2 days ago.", skills: SKILLS, jobs: [], disputes: []
    },
    "ART-0009": {
      name: "Chuka Eze", trade: "Plumbing", area: "Ajah, Lagos", email: "chuka@example.com",
      status: "info", record: "Information requested by Chidinma on 18 Oct 2026. Missing: portfolio photos (at least 3 clear photos).",
      skills: SKILLS, jobs: [], disputes: []
    },
    "ART-0010": {
      name: "Kunle Ojo", trade: "Carpentry", area: "Magodo, Lagos", email: "kunle@example.com",
      status: "rejected", record: "Rejected by Chidinma on 11 Oct 2026. Reason: portfolio does not show real work.",
      skills: ["Furniture"], jobs: [], disputes: []
    }
  };
  
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function cell(tr, content) {
    var td = document.createElement("td");
    if (typeof content === "string") td.textContent = content; else td.appendChild(content);
    tr.appendChild(td);
  }
  function maybeLink(text, href) {
    if (!href) return text;
    var a = el("a", "", text);
    a.href = href;
    return a;
  }
  function pillClass(st) { return st === "Open" ? "open" : st === "In Review" ? "review" : st === "Completed" ? "completed" : "active"; }
  
  (function () {
    var id = new URLSearchParams(window.location.search).get("id") || "ART-0001";
    var a = ARTISANS[id] || ARTISANS["ART-0001"];
    if (!ARTISANS[id]) id = "ART-0001";
  
    document.title = a.name + " | iSabiKraft Admin";
    $("crumbName").textContent = a.name;
    $("aName").textContent  = a.name;
    $("aId").textContent    = id;
    $("aTrade").textContent = a.trade;
    $("aArea").textContent  = a.area;
    $("aEmail").textContent = a.email;
    $("profilePhoto").src = PHOTOS.profile;
    $("profilePhoto").alt = a.name;
  
    var pill = $("aPill");
    pill.textContent = STATUS[a.status];
    pill.className = "pill " + a.status;
  
    a.skills.forEach(function (s) { $("aSkills").appendChild(el("span", "tag", s)); });
  
    // verification record (pending and more-info also get the button to the queue)
    var rec = $("recordMsg");
    rec.textContent = a.record;
    rec.className = "record " + a.status;
    $("recordAction").hidden = !(a.status === "pending" || a.status === "info");
  
    // evidence
    $("ninFront").src = PHOTOS.ninFront;
    $("ninBack").src  = PHOTOS.ninBack;
    $("selfie").src   = PHOTOS.selfie;
    PHOTOS.portfolio.forEach(function (p) {
      var box = el("div", "port");
      var img = document.createElement("img");
      img.src = p.src; img.alt = p.tag || "Portfolio photo";
      box.appendChild(img);
      if (p.tag) box.appendChild(el("span", "", p.tag));
      $("portfolio").appendChild(box);
    });
  
    // job history
    $("jobsEmpty").hidden = a.jobs.length > 0;
    $("jobsWrap").hidden  = a.jobs.length === 0;
    a.jobs.forEach(function (j) {
      var tr = document.createElement("tr");
      cell(tr, maybeLink(j.id, j.link));
      cell(tr, j.cat); cell(tr, j.customer); cell(tr, j.price); cell(tr, j.date);
      cell(tr, el("span", "st " + pillClass(j.st), j.st));
      $("jobsBody").appendChild(tr);
    });
  
    // disputes
    $("dispEmpty").hidden = a.disputes.length > 0;
    $("dispWrap").hidden  = a.disputes.length === 0;
    a.disputes.forEach(function (d) {
      var tr = document.createElement("tr");
      cell(tr, maybeLink(d.id, d.link));
      cell(tr, d.job); cell(tr, d.issue);
      cell(tr, el("span", "st " + pillClass(d.st), d.st));
      $("dispBody").appendChild(tr);
    });
  
    // summary
    $("sTotal").textContent = a.jobs.length;
    $("sDone").textContent  = a.jobs.filter(function (j) { return j.st === "Completed"; }).length;
    $("sDisp").textContent  = a.disputes.length;
  })();