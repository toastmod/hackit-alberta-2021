
function clamp(min, max, val) {
  if (val < min) {
    return min;
  } else if (val > max) {
    return max;
  } else {
    return val;
  }

}


var canv = document.getElementById("gameCanvas");
var two = new Two({
  fitted: true,
  autostart: true
}).appendTo(canv);

var stage = new Two.Group();
var uid = null;

function startgame() {

  var map_size = [1000, 1000];

  var size = 50; // size for player circles
  var building_size = 150;

  var fire_size = 100; // fire size
  var fire_ent = new Two.Circle(0.0, 0.0, fire_size);
  var fire_text = new Two.Text("[UNINIT FIRE]", 0.0, 0.0, {
    family: "Roboto, 'sans-serif'",
    size: 16,
    leading: 16,
    weight: 5,
  });
  var fire_act_text = new Two.Text("Press [Space] to join", 0.0, 0.0, {
    family: "Roboto, 'sans-serif'",
    size: 16,
    leading: 16,
    weight: 5,
  });
  fire_act_text.visible = false;
  fire_ent.visible = false;
  fire_text.visible = false;
  stage.add(fire_ent);

  // player(s) data
  var player_pos = [0.0, 0.0];
  var m_anchor = [0.0, 0.0];
  var entities = [];
  var move_speed = 0.10;
  var m_delta = [0.0, 0.0];
  var player_ent = new Two.Circle(0.0, 0.0, size);

  // for (var i = 0; i < 100; i++) {
  //   var x = Math.random() * map_size[0] * 2 - map_size[0];
  //   var y = Math.random() * map_size[1] * 2 - map_size[1];
  //   entities[i] = new Two.Circle(x, y, size);
  //   entities[i].noStroke().fill = '#ccc';
  //   stage.add(entities[i]);
  // }

  var action_strings = [
    "[SPACE]"
  ];

  var act_text_margin = 26;

  stage.add(player_ent);
  player_ent.noStroke().fill = '#00AAFF';
  player_ent.position.set(two.width / 2, two.height / 2);

  // bonfires data
  // loadcsv("http://sweatercuff.club/LMIC_JOBPOST_REPORT.csv");
  var buildings = [];
  var build_text = [];
  var build_pos = [];
  var build_act_text = [];
  var build_act_func = [
    function () {
      console.log("loading game...");
    }
  ];

  // for (var i = 0; i < 10; i++) {
  //   var x = Math.random() * map_size[0] * 2 - map_size[0];
  //   var y = Math.random() * map_size[1] * 2 - map_size[1];
  //   build_pos[i] = [x, y];
  //   buildings[i] = new Two.Rectangle(x, y, building_size, building_size * 1.5);
  //   buildings[i].noStroke().fill = '#ccc';
  //   buildings[i].rotation = Math.random() * 180;

  //   build_text[i] = new Two.Text("Job Corp. #" + i.toString(), x, y, {
  //     family: "Roboto, 'sans-serif'",
  //     size: 16,
  //     leading: 16,
  //     weight: 5,
  //   });

  //   build_act_text[i] = new Two.Text("Press [Space] to enter", x, y - act_text_margin, {
  //     family: "Roboto, sans-serif",
  //     size: 16,
  //     leading: 16,
  //     weight: 5,
  //   });

  //   build_act_text.visible = false;

  //   stage.add(buildings[i]);
  //   stage.add(build_act_text[i]);
  //   stage.add(build_text[i]);
  // }

  // add fire text on top
  stage.add(fire_text);
  stage.add(fire_act_text);

  // finalize stage
  two.add(stage);

  // mouse/keyboard logic
  type_selected = null;
  selected = null;

  dragging = false;

  $("body").keydown(function (e) {
    console.log(e.which);
    // SPACE
    if (e.which == 32) {
      if (type_selected != null) {
        // buildings = 0
        if (type_selected == 0) {
          if (selected != null) {
            build_act_func[selected]();
          }
        }
      }
    } else if (e.which == 69) {
      fire_text.value = prompt("Enter campfire name", "New Project");
      fire_text.position.set(player_ent.position.x, player_ent.position.y);
      fire_ent.position.set(player_ent.position.x, player_ent.position.y);
      fire_ent.visible = true;
      fire_text.visible = true;
    }
  });

  $("body").mousedown(function (e) {
    dragging = true;
    m_anchor = [e.pageX, e.pageY];
  });

  $("body").mouseup(function () {
    dragging = false;
    m_delta = [0.0, 0.0];
  });

  $("body").mouseleave(function () {
    dragging = false;
    m_delta = [0.0, 0.0];
  });

  $("body").mousemove(function (e) {
    if (dragging) {
      m_delta = [
        clamp(-50, 50, m_anchor[0] - e.pageX),
        clamp(-50, 50, m_anchor[1] - e.pageY)
      ];
    }
  });

  const socket = new WebSocket('ws://vastful.ca/echo');
  socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
  });

  socket.addEventListener('message', function (event) {
   if(event.data[0]+event.data[1] == "ID"){
     if(uid == null){
       uid = parseInt(event.data.replaceAll("ID",""));
     }
   }
  });

  // update loop
  two.bind('update', function () {

    // update player pos on screen
    // NOTE: player is offset by screen w/h, account for in websocket serial data stuff
    player_pos[0] -= m_delta[0] * move_speed;
    player_pos[1] -= m_delta[1] * move_speed;
    player_ent.position.set(player_pos[0] + (two.width / 2), player_pos[1] + (two.height / 2));

    if(uid != null){
      socket.send("P|"+player_pos[0].toString())
    }
    // camera movement
    stage.translation.x += m_delta[0] * move_speed;
    stage.translation.y += m_delta[1] * move_speed;

    // TODO: set multiplayer positions
    // for player in registry
    // render
    var hb_not_found = true;

    // look at fire hb first
    if (is_point_in([fire_ent.position.x, fire_ent.position.y], [player_ent.position.x, player_ent.position.y], size * 5)) {
      console.log("ENTERING FIRE");
      type_selected = 1;
      fire_act_text.visible = true;
    } else {
      fire_act_text.visible = false;
    }

    for (var i = 0; i < buildings.length - 1; i++) {
      if (is_point_in(build_pos[i], [player_ent.position.x, player_ent.position.y], size * 5) && hb_not_found) {
        console.log("ENTERING BUILDING");
        build_act_text[i].visible = true;
        selected = i;
        hb_not_found = false;
      }
      else {
        build_act_text[i].visible = false;
        if (selected == i) {
          selected = null;
        }
      }
    }

  });

}

// load textures here
// background tilemap
var texrec = new Two.Texture("/imgs/grass.png", function () {
  var tex_ent = two.makeRectangle(0, 0, two.width*10, two.height*10);
  texrec.repeat = 'repeat';
  tex_ent.noStroke().fill = texrec;
  stage.add(tex_ent);
  startgame();
});