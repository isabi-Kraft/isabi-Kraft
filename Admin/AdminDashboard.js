
var CHART_DATA = {
    labels:    ["Oct 2", "Oct 3", "Oct 4", "Oct 5", "Oct 6", "Oct 7", "Oct 8"],
    created:   [48, 41, 50, 65, 46, 56, 80],
    completed: [33, 26, 35, 50, 31, 36, 50]
  };
  
  // ---------- 2. Drawing ----------
  var SVG_NS = "http://www.w3.org/2000/svg";
  
  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }
  
  // Turns a list of points into a smooth curve (Catmull-Rom converted to Bezier)
  function smoothPath(pts) {
    var d = "M" + pts[0].x + "," + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C" + c1x + "," + c1y + " " + c2x + "," + c2y + " " + p2.x + "," + p2.y;
    }
    return d;
  }
  
  function drawChart(data) {
    var box = document.getElementById("activityChart");
    if (!box) return;
    box.innerHTML = "";
  
    var W = 580, H = 300;                       // the drawing's own size; it scales to fit the card
    var padL = 34, padR = 12, padT = 10, padB = 30;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var max = 100;                              // y-axis runs 0 to 100 in steps of 20
  
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H });
  
    // soft green fade under the "created" line
    var defs = el("defs", {});
    var grad = el("linearGradient", { id: "areaFade", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0%",   "stop-color": "#4a9d52", "stop-opacity": "0.22" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#4a9d52", "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);
  
    function xAt(i) { return padL + (plotW * i) / (data.labels.length - 1); }
    function yAt(v) { return padT + plotH - (plotH * v) / max; }
  
    // horizontal gridlines + y labels
    for (var v = 0; v <= max; v += 20) {
      svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: yAt(v), y2: yAt(v), "class": "grid" }));
      var t = el("text", { x: padL - 8, y: yAt(v) + 4, "text-anchor": "end", "class": "axis-label" });
      t.textContent = v;
      svg.appendChild(t);
    }
  
    // vertical gridlines + x labels
    data.labels.forEach(function (label, i) {
      svg.appendChild(el("line", { x1: xAt(i), x2: xAt(i), y1: padT, y2: padT + plotH, "class": "grid" }));
      var anchor = i === 0 ? "start" : (i === data.labels.length - 1 ? "end" : "middle");
      var tx = el("text", { x: xAt(i), y: H - 9, "text-anchor": anchor, "class": "axis-label" });
      tx.textContent = label;
      svg.appendChild(tx);
    });
  
    function toPoints(values) {
      return values.map(function (val, i) { return { x: xAt(i), y: yAt(val) }; });
    }
    var created   = toPoints(data.created);
    var completed = toPoints(data.completed);
  
    // filled area under the created line
    var line = smoothPath(created);
    svg.appendChild(el("path", {
      d: line + " L" + created[created.length - 1].x + "," + (padT + plotH) + " L" + created[0].x + "," + (padT + plotH) + " Z",
      fill: "url(#areaFade)"
    }));
  
    // the two lines
    svg.appendChild(el("path", { d: line,                    "class": "line line-created" }));
    svg.appendChild(el("path", { d: smoothPath(completed),   "class": "line line-completed" }));
  
    // the dots
    created.forEach(function (p)   { svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 3, "class": "point created" })); });
    completed.forEach(function (p) { svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 3, "class": "point completed" })); });
  
    box.appendChild(svg);
  }
  
  drawChart(CHART_DATA);
  
  // ---------- 3. 7 / 30 / 90 Days buttons ----------
  // For now they only move the highlight. When the backend is ready, call
  // drawChart(...) with that range's numbers inside the click handler.
  var rangeButtons = document.querySelectorAll(".range-btn");
  rangeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      rangeButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    });
  });