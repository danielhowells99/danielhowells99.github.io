function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL);
}

function draw() {
  background(127);
  normalMaterial();
  rotateX(accelerationX * 0.01);
  rotateY(accelerationY * 0.01);
  box(100, 100, 100);
  fill(0)
  noStroke()
  text(accelerationX,0,0)
}

function mousePressed(){
	DeviceOrientationEvent.requestPermission();
	DeviceMotionEvent.requestPermission();
}