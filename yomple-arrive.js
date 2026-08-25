(function(){
  var q = new URLSearchParams(location.search);
  var u = (typeof slugName==="function" ? slugName(q.get("u")||q.get("who")||"") : String(q.get("u")||"").toLowerCase());
  var f = String(q.get("f")||q.get("family")||"").trim().toUpperCase();
  window.YOMPLE_HANDSHAKE = !!(u && u !== "player") || q.get("from") === "yomple";
  if (f && f.indexOf("-")>0) store.familyCode = f;

  function adopt(row, progress){
    if (typeof adoptPerson==="function") adoptPerson(row, progress||{});
    else {
      var id = "u-"+(row.username||u);
      store.profiles = store.profiles || [];
      store.profiles.push({ id:id, name:row.display_name||u, username:row.username||u, avatar:row.avatar||"\u2b50", pin:row.pin||"", created:Date.now() });
      store.activeId = id;
      localStorage.setItem("star-map-v1", JSON.stringify(store));
    }
  }
  function land(){
    if (typeof renderHome==="function") renderHome();
  }
  function takeHandshake(done){
    if (!u || u==="player") { done(); return; }
    var local = (store.profiles||[]).find(function(p){ return p.username===u || slugName(p.name)===u; });
    if (local) { store.activeId = local.id; localStorage.setItem("star-map-v1", JSON.stringify(store)); done(); return; }
    if (typeof findAnyYomplePerson==="function") {
      findAnyYomplePerson(u).then(function(hit){
        if (hit && hit.table==="star_players") applyCloudRow(hit.row);
        else if (hit && hit.row) adopt(hit.row, {});
        else adopt({ username:u, display_name:u, avatar:"\u2b50" }, {});
        done();
      }).catch(function(){ adopt({ username:u, display_name:u }, {}); done(); });
    } else {
      adopt({ username:u, display_name:u }, {});
      done();
    }
  }

  if (typeof afterPaths === "function") {
    var _afterPaths = afterPaths;
    afterPaths = function(){
      if (window.YOMPLE_HANDSHAKE) {
        if (typeof buildSvg==="function") buildSvg();
        takeHandshake(land);
        return;
      }
      if (store.activeId) { _afterPaths(); return; }
      location.replace("https://yomple.com/");
    };
  }
})();
