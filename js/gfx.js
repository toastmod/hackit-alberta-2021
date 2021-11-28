
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

// players stage
var stage = new Two.Group();
var fires = new Two.Group();
var texts = new Two.Group();
var bkgd = new Two.Group();

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
  var fire_act_text = new Two.Text("Press [F] to join", 0.0, 0.0, {
    family: "Roboto, 'sans-serif'",
    size: 16,
    leading: 16,
    weight: 5,
  });
  fire_act_text.visible = false;
  fire_ent.visible = false;
  fire_text.visible = false;
  fires.add(fire_ent);

  // player(s) data
  var player_pos = [0.0, 0.0];
  var m_anchor = [0.0, 0.0];
  var entities = {};
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
    "[F]"
  ];

  var act_text_margin = 26;

  stage.add(player_ent);
  player_ent.noStroke().fill = '#00AAFF';
  player_ent.position.set(two.width / 2, two.height / 2);

  // bonfires data
  // loadcsv("http://sweatercuff.club/LMIC_JOBPOST_REPORT.csv");
  var buildings = {};
  var build_text = {};
  var build_pos = {};
  var build_act_text = {};
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

  // finalize stage orders
  two.add(bkgd);
  two.add(fires);
  two.add(stage);
  two.add(texts);
  // mouse/keyboard logic
  type_selected = null;
  selected = null;

  dragging = false;

  $("body").keydown(function (e) {
    console.log(e.which);
    // SPACE
    if (e.which == 70) {
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
      socket.send("F|"+uid+"|"+fire_text.value+"|"+fire_ent.position.x.toString()+"|"+fire_ent.position.y.toString());
      fire_ent.visible = true;
      fire_text.visible = true;
    }
  });

  $("body").mousedown(function (e) {
    dragging = true;
    m_anchor = [two.width/2, two.height/2];
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
    // socket.send('Hello Server!');
  });

  socket.addEventListener('message', function (event) {
   if(event.data[0]+event.data[1] == "ID"){
     if (uid == null) {
       uid = parseInt(event.data.replaceAll("ID", ""));
     }
   } else if (event.data[0] == 'F') {
     // bonfire serial: 
     // uid,value,x,y
     var dat = event.data.replace("F|", "").split('|');
     dat[0] = parseInt(dat[0]); // uid
     dat[2] = parseInt(dat[2]); // x
     dat[3] = parseInt(dat[3]); // y
     if (dat[0] != uid) {
       if (buildings[dat[0]] == null) {
        buildings[dat[0]] = new Two.Circle(dat[2], dat[3], fire_size);
        build_pos[dat[0]] = [dat[2],dat[3]];
        build_text[dat[0]] = new Two.Text(dat[1], dat[2], dat[3], {
           family: "Roboto, 'sans-serif'",
           size: 16,
           leading: 16,
           weight: 5,
         });
         build_act_text[dat[0]] = new Two.Text("Press [F] to join", dat[2], dat[3]+act_text_margin, {
           family: "Roboto, 'sans-serif'",
           size: 16,
           leading: 16,
           weight: 5,
         });
         build_act_text[dat[0]].visible = false;
         buildings[dat[0]].visible = true;
         build_text[dat[0]].visible = true;
         fires.add(buildings[dat[0]]);
         texts.add(build_text[dat[0]]);
         texts.add(build_act_text[dat[0]]);
       } else {
         build_text[dat[0]].value = dat[1];
         build_pos[dat[0]] = [dat[2],dat[3]];
         buildings[dat[0]].position.set(dat[2],dat[3]);
         build_text[dat[0]].position.set(dat[2],dat[3]);
         build_act_text[dat[0]].position.set(dat[2]+act_text_margin, dat[3]+act_text_margin);
       }
     }

   }else{
      var pos = event.data.split('|');
      pos[0] = parseInt(pos[0]);
      pos[1] = parseInt(pos[1]);
      pos[2] = parseInt(pos[2]);
      if (uid != pos[0]){
        if (entities[pos[0]] == null) {
          entities[pos[0]] = new Two.Circle(pos[1], pos[2], size);
          entities[pos[0]].noStroke().fill = 'orange';
          stage.add(entities[pos[0]]);
        } else {
          entities[pos[0]].position.set(pos[1], pos[2]);
        }
      }
    }
  });

  var stage_move = [0.0,0.0];

  // update loop
  two.bind('update', function () {

    // update player pos on screen
    // NOTE: player is offset by screen w/h, account for in websocket serial data stuff
    player_pos[0] -= m_delta[0] * move_speed;
    player_pos[1] -= m_delta[1] * move_speed;
    player_ent.position.set(player_pos[0] + (two.width / 2), player_pos[1] + (two.height / 2));

    if((uid != null) && dragging){
      socket.send(uid.toString()+"|"+Math.round(player_pos[0] + (two.width / 2)).toString()+"|"+Math.round(player_pos[1]+(two.height / 2)).toString());
    }
    // camera movement
    stage_move[0] = m_delta[0] * move_speed;
    stage_move[1] = m_delta[1] * move_speed;

    stage.translation.x += stage_move[0];
    stage.translation.y += stage_move[1];

    fires.translation.x += stage_move[0];
    fires.translation.y += stage_move[1];

    texts.translation.x += stage_move[0];
    texts.translation.y += stage_move[1];

    bkgd.translation.x += stage_move[0];
    bkgd.translation.y += stage_move[1];


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

    for (var [i,val] of Object.entries(buildings)) {
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
  bkgd.add(tex_ent);
  startgame();
});