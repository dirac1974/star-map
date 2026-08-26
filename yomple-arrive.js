function consumeYompleHandoff() {
  var q = new URLSearchParams(location.search);
  var rawU = (q.get("u") || q.get("who") || "").trim();
  var f = (q.get("f") || q.get("family") || "").trim();
  var username = typeof slugName === "function" ? slugName(rawU) : rawU.toLowerCase();
  window.YOMPLE_FROM_HUB = q.get("from") === "yomple" || !!(username && username !== "player");

  if (f && f.indexOf("-") > 0) {
    store.familyCode = f.toUpperCase();
    try { localStorage.setItem("star-map-v1", JSON.stringify(store)); } catch (e) {}
  }
  if (!username || username === "player") return Promise.resolve(false);

  var local = (store.profiles || []).find(function (p) {
    return p.username === username || (typeof slugName === "function" && slugName(p.name) === username);
  });
  if (local) {
    store.activeId = local.id;
    if (!local.username) local.username = username;
    try { localStorage.setItem("star-map-v1", JSON.stringify(store)); } catch (e) {}
    return Promise.resolve(true);
  }

  function enterEmpty(row) {
    row = row || {};
    var person = {
      username: row.username || username,
      display_name: row.display_name || row.name || rawU || username,
      avatar: row.avatar || "\u2b50",
      pin: row.pin || "",
      family_code: row.family_code || store.familyCode || f || null,
      fun: row.fun || {}
    };
    if (typeof adoptPerson === "function") adoptPerson(person, {});
    else {
      var id = "u-" + person.username;
      store.profiles = store.profiles || [];
      store.profiles.push({
        id: id,
        name: person.display_name,
        username: person.username,
        avatar: person.avatar,
        pin: person.pin,
        created: Date.now()
      });
      store.activeId = id;
      if (person.family_code) store.familyCode = person.family_code;
      try { localStorage.setItem("star-map-v1", JSON.stringify(store)); } catch (e) {}
    }
    if (typeof cloudSaveActive === "function") cloudSaveActive();
  }

  var lookup = typeof findAnyYomplePerson === "function"
    ? findAnyYomplePerson(username)
    : Promise.resolve(null);

  return lookup.then(function (hit) {
    if (hit && hit.table === "star_players" && hit.row) {
      if (typeof applyCloudRow === "function") applyCloudRow(hit.row);
      else enterEmpty(hit.row);
    } else if (hit && hit.row) {
      enterEmpty(hit.row);
    } else {
      enterEmpty({ username: username, display_name: rawU, family_code: store.familyCode || f });
    }
    return true;
  }).catch(function () {
    enterEmpty({ username: username, display_name: rawU, family_code: store.familyCode || f });
    return true;
  });
}

function hideFindChrome() {
  if (!window.YOMPLE_FROM_HUB) return;
  var block = document.getElementById("who-find-block");
  if (block) block.style.display = "none";
}

function wireWhoChip() {
  var badge = document.getElementById("who-badge");
  if (!badge) return;
  badge.style.cursor = "pointer";
  badge.title = "Switch player";
  badge.onclick = function () {
    if (typeof showProfiles === "function") showProfiles();
  };
}

if (typeof afterPaths === "function") {
  var _afterPathsArrive = afterPaths;
  afterPaths = function () {
    consumeYompleHandoff().then(function () {
      if (typeof buildSvg === "function") buildSvg();
      _afterPathsArrive();
      hideFindChrome();
      wireWhoChip();
    });
  };
}

if (typeof showProfiles === "function") {
  var _showProfilesArrive = showProfiles;
  showProfiles = function () {
    _showProfilesArrive();
    hideFindChrome();
  };
}

if (typeof renderHome === "function") {
  var _renderHomeArrive = renderHome;
  renderHome = function () {
    var land = document.getElementById("land");
    if (land && !land.childNodes.length && typeof buildSvg === "function") buildSvg();
    _renderHomeArrive();
    wireWhoChip();
  };
}
