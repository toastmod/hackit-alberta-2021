
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

player_pos = [0.0,0.0];
m_anchor = [0.0,0.0]; 
entities = {};
delta_mult = 0.1;
m_delta = [0.0,0.0];

for (var i = 0; i < 100; i++) {
  var x = Math.random() * two.width * 2 - two.width;
  var y = Math.random() * two.height * 2 - two.height;
  var size = 50;
  entities[i] = new Two.Circle(x, y, size);
  entities[i].noStroke().fill = '#ccc';
  stage.add(entities[i]);
}

entities[99].fill = 'red';
entities[99].position.set(two.width / 2, two.height / 2);

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
      clamp(-25,25,m_anchor[0]-e.pageX), 
      clamp(-25,25,m_anchor[1]-e.pageY)
    ];
  }
});

two.bind('update', function(){
  player_pos[0] -= m_delta[0] * delta_mult;
  player_pos[1] -= m_delta[1] *delta_mult;
  entities[99].position.set(player_pos[0] + (two.width / 2), player_pos[1] + (two.height / 2));

  stage.translation.x += m_delta[0] * delta_mult;
  stage.translation.y += m_delta[1] * delta_mult;

});


