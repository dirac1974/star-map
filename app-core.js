const STORE_KEY = "star-map-v1";
const SISTER_KEYS = ["presidents-palace-v2", "bloom.v1", "word-garden-v1"];
let store = { profiles: [], activeId: null, familyCode: null, progress: {} };
let mode = "home";
let session = "home";
let targetId = null;
let helpLevel = 0;
let walkQueue = [];
let rehearsal = { helps: 2, remaining: [] };
function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) {}
  if (!store.familyCode) {
    for (var i = 0; i < SISTER_KEYS.length; i++) {
      try {
        const s = JSON.parse(localStorage.getItem(SISTER_KEYS[i]) || "null");
        if (s && (s.familyCode || (s.store && s.store.familyCode))) {
          store.familyCode = s.familyCode || s.store.familyCode;
          break;
        }
      } catch (e) {}
    }
  }
  if (!store.profiles) store.profiles = [];
  if (!store.progress) store.progress = {};
}
function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function activeProg() {
  if (!store.activeId) return {};
  if (!store.progress[store.activeId]) store.progress[store.activeId] = { _meta: { lookAroundDone: false, cooking: [] } };
  const p = store.progress[store.activeId];
  STATE_IDS.forEach(function (id) {
    if (!p[id]) {
      p[id] = { introduced: false, facets: {} };
      FACETS.forEach(function (f) { p[id].facets[f] = { state: 0, consec: 0 }; });
    }
  });
  if (!p._meta) p._meta = { lookAroundDone: false, cooking: [] };
  return p;
}
function facetMin(id) {
  const f = activeProg()[id].facets;
  return Math.min.apply(null, FACETS.map(function (k) { return f[k].state; }));
}
function shineCount() {
  return STATE_IDS.filter(function (id) { return facetMin(id) >= 3; }).length;
}
function cookingList() {
  const p = activeProg();
  const listed = (p._meta.cooking || []).filter(function (id) { return facetMin(id) < 2; });
  if (listed.length >= 3) return listed.slice(0, 3);
  const extra = STATE_IDS.filter(function (id) { return p[id].introduced && facetMin(id) < 2 && listed.indexOf(id) < 0; });
  return listed.concat(extra).slice(0, 3);
}
function roomOf(id) {
  return ROOMS.find(function (r) { return r.states.indexOf(id) >= 0; });
}
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show";
  setTimeout(function () { t.className = "toast"; }, 2200);
}
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("on"); });
  document.getElementById(id).classList.add("on");
}
function renderMap(opts) {
  opts = opts || {};
  const stars = document.getElementById("stars");
  const p = store.activeId ? activeProg() : null;
  Object.keys(MAP_PATHS).forEach(function (id) {
    const el = document.getElementById("st-" + id);
    if (!el) return;
    el.className = "state";
    if (opts.dimExcept && opts.dimExcept !== id && !(opts.roomIds && opts.roomIds.indexOf(id) >= 0)) el.classList.add("dim");
    if (opts.roomIds && opts.roomIds.indexOf(id) >= 0 && opts.dimExcept !== id) el.classList.add("room");
    if (opts.ask === id) el.classList.add("ask");
    if (opts.miss === id) el.classList.add("miss");
    if (!opts.ask && p && STATES[id]) {
      const m = facetMin(id);
      if (p[id].introduced && m === 0) el.classList.add("known");
      if (cookingList().indexOf(id) >= 0) el.classList.add("cooking");
      if (m === 2) el.classList.add("solid");
      if (m >= 3) el.classList.add("shining");
    }
  });
  stars.innerHTML = "";
  STATE_IDS.forEach(function (id) {
    const s = STATES[id];
    const on = p && facetMin(id) >= 2;
    const c = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    c.setAttribute("points", starPoints(s.star[0], s.star[1], 6, 3));
    c.setAttribute("class", "star " + (on ? "on" : "off"));
    stars.appendChild(c);
  });
}
function starPoints(cx, cy, r, n) {
  const pts = [];
  for (var i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + i * Math.PI / 5;
    const rad = i % 2 === 0 ? r : n;
    pts.push((cx + Math.cos(ang) * rad).toFixed(1) + "," + (cy + Math.sin(ang) * rad).toFixed(1));
  }
  return pts.join(" ");
}
function buildSvg() {
  const land = document.getElementById("land");
  land.innerHTML = "";
  Object.keys(MAP_PATHS).forEach(function (id) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", MAP_PATHS[id]);
    path.setAttribute("id", "st-" + id);
    path.setAttribute("class", "state");
    path.dataset.id = id;
    path.addEventListener("click", function () { onStateTap(id); });
    land.appendChild(path);
  });
}
function onStateTap(id) {
  if (!STATES[id] && id !== "DC") return;
  if (mode === "home" || mode === "explore") {
    if (STATES[id]) openPeek(id);
    return;
  }
  if (mode === "look") {
    if (!STATES[id]) return;
    openLookCard(id);
    return;
  }
  if (mode === "find" || mode === "rehearse-find") gradeLocate(id);
}
function openPeek(id) {
  const s = STATES[id];
  const p = activeProg()[id];
  const sheet = document.getElementById("sheet");
  const min = facetMin(id);
  sheet.innerHTML =
    "<h2>" + s.name + "</h2>" +
    "<p>" + (p.introduced ? STATE_WORDS[min] : "waiting in the dark") +
    " \u00b7 " + roomOf(id).name + "</p>" +
    (p.introduced ? "<p>Capital star: <strong>" + s.capital + "</strong></p><div class='hook'>" + s.hook + "</div>" : "<p>This land is still waiting to be walked.</p>") +
    "<div class='row'><button class='softbtn' onclick='closeSheet()'>Back to the map</button></div>";
  sheet.classList.add("on");
}
function closeSheet() {
  document.getElementById("sheet").classList.remove("on");
}
function setMission(html) {
  document.getElementById("mission").innerHTML = html;
}
function renderHome() {
  mode = "home";
  session = "home";
  document.getElementById("look-done").style.display = "none";
  closeSheet();
  const p = activeProg();
  const cook = cookingList();
  const looked = p._meta.lookAroundDone;
  var mission;
  if (!looked) mission = "Start by <strong>looking around</strong>. Tap the lands you already know.";
  else if (cook.length) mission = "Stars cooking: <strong>" + cook.map(function (id) { return STATES[id].name; }).join(", ") + "</strong>.";
  else mission = "The map is growing quiet and bright.";
  setMission(mission);
  document.getElementById("who-badge").innerHTML = currentWho();
  document.querySelectorAll(".door").forEach(function (d) { d.classList.remove("suggested"); });
  document.getElementById(looked ? "door-walk" : "door-look").classList.add("suggested");
  renderMap();
  showScreen("screen-home");
}
function currentWho() {
  const pr = store.profiles.find(function (x) { return x.id === store.activeId; });
  return pr ? "<span>" + pr.avatar + "</span> " + pr.name : "";
}
function startLook() {
  mode = "look";
  session = "look";
  setMission("Tap every state you can already name. Skip is always fine.");
  renderMap();
  document.getElementById("sheet").classList.remove("on");
  showScreen("screen-home");
  document.getElementById("look-done").style.display = "block";
}
function finishLook() {
  activeProg()._meta.lookAroundDone = true;
  if (cookingList().length === 0) seedCooking();
  saveStore();
  document.getElementById("look-done").style.display = "none";
  toast("Those lands will stay softly lit.");
  renderHome();
}
function seedCooking() {
  const p = activeProg();
  const prefer = ["NV", "UT", "AZ", "CA", "TX", "FL"];
  const next = prefer.filter(function (id) { return facetMin(id) < 2; });
  ROOMS.forEach(function (r) {
    r.states.forEach(function (id) {
      if (next.indexOf(id) < 0 && facetMin(id) < 2) next.push(id);
    });
  });
  next.slice(0, 3).forEach(function (id) { p[id].introduced = true; });
  p._meta.cooking = next.slice(0, 3);
}
function openLookCard(id) {
  const sheet = document.getElementById("sheet");
  sheet.innerHTML =
    "<h2>This land?</h2><p>If you know it, type what you can. Skip keeps it dark.</p>" +
    "<label>State</label><input id='in-state' type='text' autocomplete='off' autocapitalize='words'>" +
    "<label>Capital</label><input id='in-cap' type='text' autocomplete='off' autocapitalize='words'>" +
    "<p class='hint' id='look-hint'></p>" +
    "<div class='row'>" +
    "<button class='primary' onclick='submitLook(\"" + id + "\")'>That\u2019s the one</button>" +
    "<button class='ghost' onclick='closeSheet()'>Skip</button>" +
    "</div>";
  sheet.classList.add("on");
  setTimeout(function () { document.getElementById("in-state").focus(); }, 50);
}
function norm(s) {
  s = (s || "").toLowerCase().trim().replace(/[.]/g, "").replace(/\s+/g, " ");
  if (ALIASES[s]) s = ALIASES[s];
  return s.replace(/[.]/g, "");
}
function sameName(a, b) {
  return norm(a) === norm(b);
}
function bump(id, facet, ok) {
  const f = activeProg()[id].facets[facet];
  if (ok) {
    f.consec += 1;
    if (f.consec >= 3 && f.state < 3) f.state = 3;
    else if (f.consec >= 2 && f.state < 2) f.state = 2;
    else if (f.state < 1) f.state = 1;
  } else {
    f.consec = 0;
  }
}
function submitLook(id) {
  const s = STATES[id];
  const st = document.getElementById("in-state").value;
  const cap = document.getElementById("in-cap").value;
  const p = activeProg()[id];
  p.introduced = true;
  const nameOk = sameName(st, s.name);
  const capOk = sameName(cap, s.capital);
  bump(id, "locate", true);
  if (nameOk) { bump(id, "nameState", true); if (st.trim()) bump(id, "spellState", true); }
  if (capOk) { bump(id, "nameCapital", true); if (cap.trim()) bump(id, "spellCapital", true); }
  const cook = activeProg()._meta.cooking || [];
  if (cook.indexOf(id) < 0 && facetMin(id) < 2 && cook.length < 3) {
    activeProg()._meta.cooking = cook.concat([id]);
  }
  saveStore();
  closeSheet();
  renderMap();
  toast(nameOk ? "Lit a little." : "We\u2019ll walk this one later.");
}
