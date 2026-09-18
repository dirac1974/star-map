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
function sbRpc(fn, args, token){
  return fetch(SB_URL+"/rest/v1/rpc/"+fn, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: "Bearer "+(token || SB_KEY),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args || {})
  }).then(function(r){ return r.ok ? r.json() : null; });
}
function cloudGetTable(table, username){
  return sbRpc("yomple_player_find", { p_table: table, p_username: username })
    .catch(function(){ return null; });
}
function cloudGet(username){ return cloudGetTable(YOMPLE_TABLE, username); }
function findAnyYomplePerson(username){
  return sbRpc("yomple_player_find_any", { p_username: username, p_prefer: YOMPLE_TABLE })
    .then(function(row){ return row ? { table: row.table, row: row } : null; })
    .catch(function(){ return null; });
}
/* Rows come back without a PIN. When one is set the PIN must be typed, and the
   server compares it; the typed PIN is then cached locally as before. */
function yompleClaim(table, row){
  if (!row) return Promise.resolve(null);
  if (!row.has_pin) return Promise.resolve(row);
  var typed = null;
  try { typed = window.prompt("PIN for "+(row.display_name || row.username)); } catch (e) {}
  if (!typed) return Promise.resolve(null);
  return sbRpc("yomple_player_claim", { p_table: table, p_username: row.username, p_pin: typed })
    .then(function(full){ if (full) full.pin = typed; return full; })
    .catch(function(){ return null; });
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
  sbRpc("yomple_player_upsert", {
    p_table: YOMPLE_TABLE,
    p_username: body.username,
    p_pin: body.pin || null,
    p_row: {
      display_name: body.display_name,
      avatar: body.avatar,
      family_code: body.family_code || null,
      progress: body.progress,
      fun: body.fun
    }
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
    existing.pin = row.pin || existing.pin || "";
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
    return yompleClaim(hit.table, hit.row).then(function(row){
      if (!row) { toast("PIN did not match"); return; }
      if (row.family_code) store.familyCode = row.family_code;
      if (hit.table === YOMPLE_TABLE) applyCloudRow(row);
      else adoptPerson(row, {});
      toast("Welcome back, "+row.display_name);
      setTimeout(renderHome, 400);
    });
  });
}
