window.MAP_PATHS = window.MAP_PATHS || {};
window.__mapReady = fetch("https://cdn.jsdelivr.net/gh/NPashaP/a74faf20b492ad377312/uStates.js")
  .then(function (r) { return r.text(); })
  .then(function (txt) {
    var re = /\{id:"([A-Z]{2})",n:"[^"]*",d:"([^"]+)"\}/g;
    var m;
    while ((m = re.exec(txt))) {
      var id = m[1] === "LS" ? "LA" : m[1];
      window.MAP_PATHS[id] = m[2];
    }
  })
  .catch(function () {
    console.warn("Map outlines did not load from the CDN.");
  });
