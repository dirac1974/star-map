window.MAP_PATHS = window.MAP_PATHS || {};

function pathCount() {
  return Object.keys(window.MAP_PATHS || {}).length;
}

function parseGistText(txt) {
  var re = /\{id:"([A-Z]{2})",n:"[^"]*",d:"([^"]+)"\}/g;
  var m;
  while ((m = re.exec(txt))) {
    var id = m[1] === "LS" ? "LA" : m[1];
    window.MAP_PATHS[id] = m[2];
  }
}

function loadGist() {
  if (pathCount() >= 50) return Promise.resolve();
  return fetch("https://gist.githubusercontent.com/NPashaP/a74faf20b492ad377312/raw/uStates.js?cachebust=1")
    .then(function (r) {
      if (!r.ok) throw new Error("gist " + r.status);
      return r.text();
    })
    .then(parseGistText);
}

window.__mapReady = loadGist().catch(function (err) {
  console.warn("Map outlines did not load.", err);
});
