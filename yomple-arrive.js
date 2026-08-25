(function(){
  var q = new URLSearchParams(location.search);
  var u = (typeof slugName==="function" ? slugName(q.get("u")||q.get("who")||"") : String(q.get("u")||"").toLowerCase());
  var f = String(q.get("f")||q.get("family")||"").trim().toUpperCase();
  if (!u || u==="player") return;
  if (f && f.indexOf("-")>0) store.familyCode = f;
  function go(){
    try { history.replaceState({}, "", location.pathname); } catch(e){}
    if (typeof renderHome==="function") renderHome();
  }
  var local = (store.profiles||[]).find(function(p){ return p.username===u || (p.name||"").toLowerCase()===u; });
  if (local) { store.activeId = local.id; localStorage.setItem("star-map-v1", JSON.stringify(store)); go(); return; }
  function adopt(row, progress){
    if (typeof adoptPerson==="function") adoptPerson(row, progress||{});
    else {
      var id = "u-"+(row.username||u);
      store.profiles.push({ id:id, name:row.display_name||u, username:row.username||u, avatar:row.avatar||"\u2b50", pin:row.pin||"", created:Date.now() });
      store.activeId = id;
      localStorage.setItem("star-map-v1", JSON.stringify(store));
    }
  }
  if (typeof findAnyYomplePerson==="function") {
    findAnyYomplePerson(u).then(function(hit){
      if (hit && hit.table==="star_players") applyCloudRow(hit.row);
      else if (hit && hit.row) adopt(hit.row, {});
      else adopt({ username:u, display_name:u, avatar:"\u2b50" }, {});
      go();
    }).catch(function(){ adopt({ username:u, display_name:u }, {}); go(); });
  } else {
    adopt({ username:u, display_name:u }, {});
    go();
  }
})();
