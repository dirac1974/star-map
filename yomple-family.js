function ensureFamily(){
  if (!store.familyCode) {
    var words = ["OAK","MAPLE","PINE","CEDAR","ELM","BIRCH","WILLOW","ASPEN","LAUREL","HOLLY"];
    var chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    var tail = "";
    for (var i=0;i<4;i++) tail += chars.charAt(Math.floor(Math.random()*chars.length));
    store.familyCode = words[Math.floor(Math.random()*words.length)] + "-" + tail;
    if (typeof saveStore === "function") saveStore();
    else localStorage.setItem(YOMPLE_STORE, JSON.stringify(store));
    upsertFamilyRow();
  }
  return store.familyCode;
}
function upsertFamilyRow(){
  if (!store.familyCode) return;
  fetch(SB_URL+"/rest/v1/hop_families", {
    method: "POST",
    headers: sbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({
      family_code: store.familyCode,
      parent_email: store.parentEmail || null,
      updated_at: new Date().toISOString()
    })
  }).catch(function(){});
}
function paintFamilyPanel(){
  ensureFamily();
  var el = document.getElementById("family-code-value");
  if (el) el.textContent = store.familyCode;
  var em = document.getElementById("parent-email");
  if (em && store.parentEmail) em.value = store.parentEmail;
}
function saveParentEmail(){
  var em = (document.getElementById("parent-email") && document.getElementById("parent-email").value || "").trim().toLowerCase();
  if (!em || em.indexOf("@") < 1) { toast("Add a parent email first"); return; }
  store.parentEmail = em;
  ensureFamily();
  saveStore();
  upsertFamilyRow();
  toast("Parent email saved for this household");
}
function emailCodeToMyself(){
  ensureFamily();
  var em = (document.getElementById("parent-email") && document.getElementById("parent-email").value || store.parentEmail || "").trim();
  var kids = (store.profiles||[]).map(function(p){ return p.name; }).join(", ") || "(no walkers yet)";
  var body = "Yomple / Star Map family code:\n\n"+store.familyCode+"\n\nWalkers: "+kids+"\n\nOn a new device: Parent recovery → type this code.";
  window.location.href = "mailto:"+encodeURIComponent(em)+"?subject="+encodeURIComponent("Our Star Map family code")+"&body="+encodeURIComponent(body);
}
function sendEmailOtp(){
  var em = (document.getElementById("recover-email") && document.getElementById("recover-email").value || "").trim().toLowerCase();
  if (!em || em.indexOf("@") < 1) { toast("Type the parent email"); return; }
  toast("Sending a one-time code…");
  fetch(SB_URL+"/auth/v1/otp", {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: "Bearer "+SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: em, create_user: true })
  }).then(function(r){
    if (!r.ok) throw new Error("otp");
    document.getElementById("otp-row").style.display = "block";
    toast("Check that inbox for a 6-digit code");
  }).catch(function(){
    toast("Inbox send did not go through. Email the family code to yourself from Parent instead.");
  });
}
function verifyEmailOtp(){
  var em = (document.getElementById("recover-email") && document.getElementById("recover-email").value || "").trim().toLowerCase();
  var token = (document.getElementById("recover-otp") && document.getElementById("recover-otp").value || "").trim();
  if (!token) { toast("Type the code from the email"); return; }
  fetch(SB_URL+"/auth/v1/verify", {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: "Bearer "+SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "email", email: em, token: token })
  }).then(function(r){ return r.json(); }).then(function(auth){
    if (!auth || auth.error || (!auth.access_token && !auth.token)) throw new Error("bad otp");
    return fetch(SB_URL+"/rest/v1/hop_families?parent_email=eq."+encodeURIComponent(em), { headers: sbHeaders() }).then(function(r){ return r.json(); });
  }).then(function(rows){
    if (!rows || !rows.length) {
      toast("That email is not linked yet. Save it on Parent / Progress first.");
      return;
    }
    restoreFamily(rows[0].family_code);
  }).catch(function(){
    toast("That code did not match. Use the family code from your self-email.");
  });
}
function restoreFamily(code){
  code = String(code || (document.getElementById("restore-code") && document.getElementById("restore-code").value) || "").trim().toUpperCase();
  if (!code || code.indexOf("-") < 0) { toast("Type the family code (like MAPLE-K7Q2)"); return; }
  store.familyCode = code;
  toast("Finding this household…");
  fetch(SB_URL+"/rest/v1/"+YOMPLE_TABLE+"?family_code=eq."+encodeURIComponent(code), { headers: sbHeaders() })
    .then(function(r){ return r.json(); })
    .then(function(rows){
      if (rows && rows.length) {
        rows.forEach(function(row, i){
          applyCloudRow(row);
          if (i === 0) store.activeId = "u-"+row.username;
        });
        if (typeof _saveStar === "function") _saveStar();
        else saveStore();
        toast("Household restored — "+rows.length+" walker"+(rows.length===1?"":"s"));
        setTimeout(showProfiles, 400);
        return null;
      }
      return fetch(SB_URL+"/rest/v1/hop_players?family_code=eq."+encodeURIComponent(code), { headers: sbHeaders() })
        .then(function(r){ return r.json(); });
    })
    .then(function(people){
      if (!people) return;
      if (!people.length) {
        saveStore();
        upsertFamilyRow();
        toast("Code saved. Create the first walker here.");
        showCreate();
        return;
      }
      people.forEach(function(row){ adoptPerson(row, {}); });
      toast("Same household. Map progress starts fresh.");
      setTimeout(showProfiles, 400);
    })
    .catch(function(){ toast("Could not reach the cloud just now"); });
}
function showRecover(){
  showScreen("screen-recover");
}
if (typeof showParent === "function") {
  var _showParentStar = showParent;
  showParent = function(){
    _showParentStar();
    paintFamilyPanel();
  };
}
if (store && store.profiles && store.profiles.length) ensureFamily();
