let myCanvas
let c = 0

function preload() {
}

function setup() {
  myCanvas = createCanvas(window.innerWidth, window.innerHeight);
  
  btn = createButton("Motion");
  btn.mousePressed(function(){
	DeviceOrientationEvent.requestPermission();
  });
  
  noStroke();
}

function draw() {
	background(255*c)
	fill('red')
	text(c,width/2,height/2)
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function deviceShaken() {
	c = (c + 0.25)%2
}