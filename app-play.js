function startWalk() {
  session = "walk";
  let cook = cookingList();
  if (cook.length < 3) seedCooking();
  cook = cookingList();
  const first = cook[0] || "NV";
  walkQueue = cook.slice();
  beginWalkItem(walkQueue.shift(), roomOf(first));
}
function beginWalkItem(id, room) {
  targetId = id;
  helpLevel = 0;
  mode = "show";
  const s = STATES[id];
  activeProg()[id].introduced = true;
  saveStore();
  setMission("This is <strong>" + s.name + "</strong>. Capital star: <strong>" + s.capital + "</strong>.");
  renderMap({ roomIds: room.states, ask: id });
  const sheet = document.getElementById("sheet");
  sheet.innerHTML =
    "<h2>" + s.name + "</h2>" +
    "<p>Capital: <strong>" + s.capital + "</strong> \u00b7 " + room.name + "</p>" +
    "<div class='hook'>" + s.hook + "</div>" +
    "<div class='row'><button class='primary' onclick='startFind()'>Find it on the map</button></div>";
  sheet.classList.add("on");
  showScreen("screen-home");
}
function startFind() {
  mode = "find";
  helpLevel = 0;
  closeSheet();
  const s = STATES[targetId];
  setMission("Tap <strong>" + s.name + "</strong>.");
  const room = roomOf(targetId);
  renderMap({ roomIds: helpLevel >= 1 ? room.states : null });
}
function gradeLocate(id) {
  const room = roomOf(targetId);
  if (id === targetId) {
    bump(targetId, "locate", true);
    saveStore();
    toast("That\u2019s the land.");
    askSpell(targetId);
    return;
  }
  bump(targetId, "locate", false);
  helpLevel += 1;
  saveStore();
  if (session === "rehearse") {
    setMission("Try another shape. Lanterns left: <strong>" + rehearsal.helps + "</strong>.");
    renderMap({ miss: id });
    return;
  }
  if (helpLevel === 1) {
    setMission("Look in <strong>" + room.name + "</strong>.");
    renderMap({ roomIds: room.states, miss: id });
  } else if (helpLevel === 2) {
    setMission("Neighbors can help. Still looking for that shape.");
    renderMap({ roomIds: room.states });
  } else {
    setMission("Here it is. Tap it once more so your hand remembers.");
    renderMap({ roomIds: room.states, ask: targetId });
  }
}
function askSpell(id) {
  mode = "spell";
  const s = STATES[id];
  const sheet = document.getElementById("sheet");
  sheet.innerHTML =
    "<h2>Spell the names</h2><p>" + s.hook + "</p>" +
    "<label>State</label><input id='in-state' type='text' autocomplete='off' autocapitalize='words'>" +
    "<label>Capital</label><input id='in-cap' type='text' autocomplete='off' autocapitalize='words'>" +
    "<p class='hint' id='spell-hint'></p>" +
    "<div class='row'>" +
    "<button class='primary' onclick='submitSpell(\"" + id + "\")'>Check</button>" +
    "<button class='ghost' onclick='showModel(\"" + id + "\")'>Another way</button>" +
    "</div>";
  sheet.classList.add("on");
  setTimeout(function () { document.getElementById("in-state").focus(); }, 50);
}
function showModel(id) {
  const s = STATES[id];
  document.getElementById("spell-hint").textContent = s.name + " \u00b7 " + s.capital;
}
function submitSpell(id) {
  const s = STATES[id];
  const st = document.getElementById("in-state").value;
  const cap = document.getElementById("in-cap").value;
  const nameOk = sameName(st, s.name);
  const capOk = sameName(cap, s.capital);
  bump(id, "nameState", nameOk);
  bump(id, "spellState", nameOk);
  bump(id, "nameCapital", capOk);
  bump(id, "spellCapital", capOk);
  saveStore();
  if (nameOk && capOk) {
    closeSheet();
    advanceSession();
  } else {
    const hint = [];
    if (!nameOk) hint.push(s.name);
    if (!capOk) hint.push(s.capital);
    document.getElementById("spell-hint").textContent = "Try another way: " + hint.join(" \u00b7 ");
  }
}
function advanceSession() {
  if (session === "rehearse") { nextRehearse(); return; }
  if (walkQueue.length) {
    const id = walkQueue.shift();
    if (session === "walk") beginWalkItem(id, roomOf(id));
    else startFindTarget(id);
  } else {
    toast(session === "walk" ? "That\u2019s enough walking for now." : "Stars are a little brighter.");
    renderHome();
  }
}
function startFindTarget(id) {
  targetId = id;
  mode = "find";
  helpLevel = 0;
  closeSheet();
  setMission("Tap <strong>" + STATES[id].name + "</strong>.");
  renderMap();
}
function startLight() {
  session = "light";
  const p = activeProg();
  const pool = STATE_IDS.filter(function (id) { return p[id].introduced; });
  const cook = cookingList();
  const due = pool.filter(function (id) { return cook.indexOf(id) < 0 && facetMin(id) >= 2; });
  const picks = cook.concat(due).slice(0, 6);
  if (!picks.length) {
    toast("Look around or walk a room first.");
    return;
  }
  walkQueue = picks.slice(1);
  startFindTarget(picks[0]);
}
function startRehearse() {
  session = "rehearse";
  rehearsal.helps = 2;
  const p = activeProg();
  const known = STATE_IDS.filter(function (id) { return p[id].introduced; });
  rehearsal.remaining = (known.length >= 8 ? known : cookingList().concat(["NV","UT","AZ","CA"])).filter(function (id, i, a) { return a.indexOf(id) === i; });
  nextRehearse();
}
function nextRehearse() {
  if (!rehearsal.remaining.length) {
    setMission("Dress rehearsal is done. Two lanterns were the whole budget.");
    toast("The map remembers your hands.");
    renderHome();
    return;
  }
  targetId = rehearsal.remaining.shift();
  mode = "rehearse-find";
  closeSheet();
  setMission("Tap the next land. Lanterns left: <strong>" + rehearsal.helps + "</strong>.");
  renderMap();
}
function useHelp() {
  if (mode !== "rehearse-find" && mode !== "spell") return;
  if (rehearsal.helps <= 0) { toast("Those two lanterns are spent."); return; }
  rehearsal.helps -= 1;
  const s = STATES[targetId];
  toast(s.name + " \u00b7 " + s.capital);
  setMission("A lantern was used. " + rehearsal.helps + " left.");
}
function showProfiles() {
  const grid = document.getElementById("profile-grid");
  grid.innerHTML = "";
  store.profiles.forEach(function (pr) {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = "<div class='av'>" + pr.avatar + "</div><div>" + pr.name + "</div>";
    d.onclick = function () { store.activeId = pr.id; saveStore(); renderHome(); };
    grid.appendChild(d);
  });
  showScreen("screen-profiles");
}
function showCreate() {
  const box = document.getElementById("avatar-choices");
  box.innerHTML = "";
  box.dataset.selected = AVATARS[0];
  AVATARS.forEach(function (a) {
    const s = document.createElement("span");
    s.textContent = a;
    if (a === AVATARS[0]) s.classList.add("sel");
    s.onclick = function () {
      box.dataset.selected = a;
      box.querySelectorAll("span").forEach(function (x) { x.classList.remove("sel"); });
      s.classList.add("sel");
    };
    box.appendChild(s);
  });
  document.getElementById("new-name").value = "";
  var pinEl = document.getElementById("new-pin");
  if (pinEl) pinEl.value = "";
  showScreen("screen-create");
}
function createProfile() {
  const name = document.getElementById("new-name").value.trim() || "Map walker";
  const avatar = document.getElementById("avatar-choices").dataset.selected || "⭐";
  const pin = (document.getElementById("new-pin") && document.getElementById("new-pin").value.trim()) || "";
  const username = slugName(name);
  toast("Checking that name…");
  cloudGet(username).then(function (exists) {
    if (exists) {
      toast("That name is already on Star Map. Use Find my map.");
      return null;
    }
    return findAnyYomplePerson(username);
  }).then(function (hit) {
    if (hit === null) return;
    if (hit && hit.row) {
      if (hit.row.family_code) store.familyCode = hit.row.family_code;
      adoptPerson({
        username: hit.row.username,
        display_name: hit.row.display_name,
        avatar: hit.row.avatar || avatar,
        pin: hit.row.pin || pin,
        family_code: hit.row.family_code,
        fun: hit.row.fun || {}
      }, {});
      toast("Same kid as the other Yomple worlds. Map starts fresh.");
      setTimeout(renderHome, 400);
      return;
    }
    ensureFamily();
    const id = "u-" + username;
    store.profiles.push({ id: id, name: name, avatar: avatar, username: username, pin: pin, created: Date.now() });
    store.activeId = id;
    saveStore();
    activeProg();
    toast("Welcome, " + name);
    renderHome();
  });
}
function showParent() {
  const body = document.getElementById("parent-body");
  let html = "<p>Shining lands: " + shineCount() + "</p>";
  html += "<table><tr><th>State</th><th>Capital</th><th>Where</th></tr>";
  STATE_IDS.forEach(function (id) {
    const s = STATES[id];
    html += "<tr><td>" + s.name + "</td><td>" + s.capital + "</td><td>" + STATE_WORDS[facetMin(id)] + "</td></tr>";
  });
  html += "</table>";
  body.innerHTML = html;
  showScreen("screen-parent");
}
function afterPaths() {
  buildSvg();
  if (!store.profiles.length) showProfiles();
  else if (!store.activeId) showProfiles();
  else renderHome();
}
function boot() {
  loadStore();
  if (window.__mapReady && window.__mapReady.then) window.__mapReady.then(afterPaths);
  else afterPaths();
}
window.startLook = startLook;
window.finishLook = finishLook;
window.startWalk = startWalk;
window.startLight = startLight;
window.startRehearse = startRehearse;
window.startFind = startFind;
window.submitLook = submitLook;
window.submitSpell = submitSpell;
window.showModel = showModel;
window.closeSheet = closeSheet;
window.showProfiles = showProfiles;
window.showCreate = showCreate;
window.createProfile = createProfile;
window.showParent = showParent;
window.renderHome = renderHome;
window.useHelp = useHelp;
window.findHall = findHall;
window.restoreFamily = restoreFamily;
window.showRecover = showRecover;
document.addEventListener("DOMContentLoaded", boot);
