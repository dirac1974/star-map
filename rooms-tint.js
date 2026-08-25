function paintRoomTints(){
  if (typeof MAP_PATHS === "undefined") return;
  Object.keys(MAP_PATHS).forEach(function(id){
    var el = document.getElementById("st-" + id);
    if (!el) return;
    var r = roomOf(id);
    if (r) el.classList.add("rg-" + r.id);
  });
}
function paintRoomKey(){
  var box = document.getElementById("room-key");
  if (!box) return;
  box.innerHTML = ROOMS.map(function(r){
    return "<span class='rk rk-"+r.id+"'><i></i>"+r.name+"</span>";
  }).join("");
}
if (typeof renderMap === "function") {
  var _renderMapRooms = renderMap;
  renderMap = function(opts){
    _renderMapRooms(opts);
    paintRoomTints();
  };
}
if (typeof renderHome === "function") {
  var _renderHomeRooms = renderHome;
  renderHome = function(){
    _renderHomeRooms();
    paintRoomKey();
  };
}
if (typeof buildSvg === "function") {
  var _buildSvgRooms = buildSvg;
  buildSvg = function(){
    _buildSvgRooms();
    paintRoomTints();
    paintRoomKey();
  };
}
