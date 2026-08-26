var SB_URL = "https://digcgqltrlmhgmzgmvwc.supabase.co";
var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2NncWx0cmxtaGdtemdtdndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODY4NjEsImV4cCI6MjA4OTE2Mjg2MX0.suxy0jXsIJqrJYbQuCc54sHbN5miCICxLUdOc9gUTkY";
var YOMPLE_MODULE = "star";
var YOMPLE_TABLE = "star_players";
var YOMPLE_STORE = "star-map-v1";
var YOMPLE_SISTERS = ["star_players","hop_players","bloom_players","garden_players","field_players"];
var cloudTimer = null;

function slugName(s){
  return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,18) || "player";
}
function sbHeaders(extra){
  var h = {
    apikey: SB_KEY,
    Authorization: "Bearer "+SB_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
  if (extra) Object.keys(extra).forEach(function(k){ h[k] = extra[k]; });
  return h;
}
function cloudGetTable(table, username){
  return fetch(SB_URL+"/rest/v1/"+table+"?username=eq."+encodeURIComponent(username), { headers: sbHeaders() })
    .then(function(r){ return r.json(); })
    .then(function(rows){ return (rows && rows[0]) || null; })
    .catch(function(){ return null; });
}
function cloudGet(username){ return cloudGetTable(YOMPLE_TABLE, username); }
function findAnyYomplePerson(username){
  var chain = Promise.resolve(null);
  YOMPLE_SISTERS.forEach(function(table){
    chain = chain.then(function(found){
      if (found) return found;
      return cloudGetTable(table, username).then(function(row){
        return row ? { table: table, row: row } : null;
      });
    });
  });
  return chain;
}
function payloadForActive(){
  var p = (store.profiles||[]).find(function(x){ return x.id === store.activeId; });
  if (!p) return null;
  if (!p.username) p.username = slugName(p.name);
  return {
    username: p.username,
    display_name: p.name,
    avatar: p.avatar || "\u2b50",
    pin: p.pin || null,
    family_code: store.familyCode || null,
    progress: (store.progress && store.progress[p.id]) || {},
    fun: (store.fun && store.fun[p.id]) || {},
    updated_at: new Date().toISOString()
  };
}
function cloudSaveActive(){
  var body = payloadForActive();
  if (!body) return;
  fetch(SB_URL+"/rest/v1/"+YOMPLE_TABLE, {
    method: "POST",
    headers: sbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(body)
  }).catch(function(){});
}
function scheduleCloudSave(){
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(cloudSaveActive, 700);
}
if (typeof saveStore === "function") {
  var _saveStar = saveStore;
  saveStore = function(){
    _saveStar();
    scheduleCloudSave();
  };
}
function adoptPerson(row, progress){
  var id = "u-"+row.username;
  var existing = (store.profiles||[]).find(function(p){ return p.id === id || p.username === row.username; });
  if (existing) {
    existing.name = row.display_name;
    existing.avatar = row.avatar;
    existing.username = row.username;
    existing.pin = row.pin || "";
    id = existing.id;
  } else {
    store.profiles = store.profiles || [];
    store.profiles.push({ id:id, name:row.display_name, avatar:row.avatar, username:row.username, pin:row.pin||"", created: Date.now() });
  }
  store.activeId = id;
  if (!store.progress) store.progress = {};
  if (progress && Object.keys(progress).length) store.progress[id] = progress;
  else if (!store.progress[id]) store.progress[id] = {};
  if (!store.fun) store.fun = {};
  store.fun[id] = row.fun || store.fun[id] || {};
  if (row.family_code) store.familyCode = row.family_code;
  if (typeof _saveStar === "function") _saveStar();
  else localStorage.setItem(YOMPLE_STORE, JSON.stringify(store));
  scheduleCloudSave();
  return id;
}
function applyCloudRow(row){
  adoptPerson(row, row.progress || {});
}
function findHall(){
  var input = document.getElementById("find-user");
  var username = slugName(input && input.value);
  if (!username || username === "player") { toast("Type the saved player name"); return; }
  toast("Looking for "+username+"\u2026");
  findAnyYomplePerson(username).then(function(hit){
    if (!hit) { toast("No Yomple player with that name yet"); return; }
    var row = hit.row;
    if (row.pin) {
      var pin = window.prompt("PIN for "+row.display_name);
      if (pin !== row.pin) { toast("PIN did not match"); return; }
    }
    if (row.family_code) store.familyCode = row.family_code;
    if (hit.table === YOMPLE_TABLE) applyCloudRow(row);
    else adoptPerson(row, {});
    toast("Welcome back, "+row.display_name);
    setTimeout(renderHome, 400);
  });
}
