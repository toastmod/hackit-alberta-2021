
function clamp(min,max,val){
  if(val < min) {
    return min;
  }else if(val > max) {
    return max;
  }else{ 
    return val;
  }

}

var two = new Two({
  fullscreen: true,
  autostart: true
}).appendTo(document.body);

var stage = new Two.Group();
stage.fill = 'chartreuse';

var map_size = [1000,1000];

// size for player circles
var size = 50;

// building size... duh
var building_size = 150;

// player(s) data
var player_pos = [0.0,0.0];
var m_anchor = [0.0,0.0];
var entities = [];
var move_speed = 0.05;
var m_delta = [0.0,0.0];
var player_ent = new Two.Circle(0.0, 0.0, size);

// for (var i = 0; i < 100; i++) {
//   var x = Math.random() * map_size[0] * 2 - map_size[0];
//   var y = Math.random() * map_size[1] * 2 - map_size[1];
//   entities[i] = new Two.Circle(x, y, size);
//   entities[i].noStroke().fill = '#ccc';
//   stage.add(entities[i]);
// }

stage.add(player_ent);
player_ent.noStroke().fill = '#00AAFF';
player_ent.position.set(two.width / 2, two.height / 2);

// institutions data
// loadcsv("http://sweatercuff.club/LMIC_JOBPOST_REPORT.csv");
var buildings = [];
var build_text = [];
var build_pos = [];
for (var i = 0; i < 10; i++) {
  var x = Math.random() * map_size[0] * 2 - map_size[0];
  var y = Math.random() * map_size[1] * 2 - map_size[1];
  build_pos[i] = [x,y];
  buildings[i] = new Two.Rectangle(x,y,building_size,building_size*1.5);
  buildings[i].noStroke().fill = '#ccc';
  buildings[i].rotation = Math.random() * 180;

  build_text[i] = new Two.Text("JOB CORP.", x,y,{
    family: "Roboto, 'sans-serif'",
    size: 16,
    leading: 16,
    weight: 5,
  });
  stage.add(buildings[i]);
  stage.add(build_text[i]);
}

// finalize stage
two.add(stage);

dragging = false;

$("body").mousedown(function(e){
  dragging = true;
  m_anchor = [e.pageX, e.pageY];
});

$("body").mouseup(function(){
  dragging = false;
  m_delta = [0.0,0.0];
});

$("body").mouseleave(function(){
  dragging = false;
  m_delta = [0.0,0.0];
});

$("body").mousemove(function(e){
  if(dragging) {
    m_delta = [
      clamp(-50,50,m_anchor[0]-e.pageX), 
      clamp(-50,50,m_anchor[1]-e.pageY)
    ];
  }
});


two.bind('update', function(){

  // update player pos on screen
  // NOTE: player is offset by screen w/h, account for in websocket serial data stuff
  player_pos[0] -= m_delta[0] * move_speed;
  player_pos[1] -= m_delta[1] * move_speed;
  player_ent.position.set(player_pos[0] + (two.width / 2), player_pos[1] + (two.height / 2));

  // camera movement
  stage.translation.x += m_delta[0] * move_speed;
  stage.translation.y += m_delta[1] * move_speed;

  // TODO: set multiplayer positions
  // for player in registry
      // render
  for(var i=0; i < buildings.length-1; i++) {
    if( is_point_in(build_pos[i],[player_ent.position.x, player_ent.position.y],size) ) {
      console.log("ENTERING BUILDING");
    }
  }

});


