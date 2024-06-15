let xRot = 0
let yRot = 0

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL);
}

function draw() {
  background(127);
  normalMaterial();
  
  xRot += accelerationX * 0.01
  yRot += accelerationY * 0.01
  
  rotateX(xRot);
  rotateY(yRot);
  box(100, 100, 100);
  fill(0)
  noStroke()
  text(accelerationX,displayWidth/4,displayHeight/4)
}

function mousePressed(){
	DeviceOrientationEvent.requestPermission();
	DeviceMotionEvent.requestPermission();
}