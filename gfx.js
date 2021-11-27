var two = new Two({
  fullscreen: true,
  autostart: true
}).appendTo(document.body);

var stage = new Two.Group();

for (var i = 0; i < 100; i++) {
  var x = Math.random() * two.width * 2 - two.width;
  var y = Math.random() * two.height * 2 - two.height;
  var size = 50;
  var shape = new Two.Circle(x, y, size);
  shape.noStroke().fill = '#ccc';
  stage.add(shape);
}

shape.fill = 'red';
shape.position.set(two.width / 2, two.height / 2);

two.add(stage);


