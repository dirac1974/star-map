window.MAP_PATHS = window.MAP_PATHS || {};

function pathCount() {
  return Object.keys(window.MAP_PATHS || {}).length;
}

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { resolve(true); };
    s.onerror = function () { reject(new Error(src)); };
    document.head.appendChild(s);
  });
}

function parseGistText(txt) {
  var re = /\{id:"([A-Z]{2})",n:"[^"]*",d:"([^"]+)"\}/g;
  var m;
  while ((m = re.exec(txt))) {
    var id = m[1] === "LS" ? "LA" : m[1];
    window.MAP_PATHS[id] = m[2];
  }
}

function loadLocalParts() {
  var parts = [];
  for (var i = 1; i <= 11; i++) parts.push("map-part-" + i + ".js");
  return parts.reduce(function (p, src) {
    return p.then(function () {
      return loadScript(src);
    }).catch(function () {
      return false;
    });
  }, Promise.resolve());
}

function loadGistFallback() {
  if (pathCount() >= 50) return Promise.resolve();
  return fetch("https://gist.githubusercontent.com/NPashaP/a74faf20b492ad377312/raw/uStates.js")
    .then(function (r) {
      if (!r.ok) throw new Error("gist " + r.status);
      return r.text();
    })
    .then(parseGistText);
}

window.__mapReady = loadLocalParts()
  .then(loadGistFallback)
  .then(function () {
    if (pathCount() < 48) console.warn("Map outlines incomplete:", pathCount());
  })
  .catch(function (err) {
    console.warn("Map outlines did not load.", err);
  });
