window.MAP_PATHS = window.MAP_PATHS || {};
window.__mapReady = fetch("https://gist.githubusercontent.com/NPashaP/a74faf20b492ad377312/raw/uStates.js")
  .then(function (r) { return r.text(); })
  .then(function (txt) {
    var re = /\{id:"([A-Z]{2})",n:"[^"]*",d:"([^"]+)"\}/g;
    var m;
    while ((m = re.exec(txt))) {
      var id = m[1] === "LS" ? "LA" : m[1];
      window.MAP_PATHS[id] = m[2];
    }
  })
  .catch(function (err) {
    console.warn("Map outlines did not load.", err);
  });
