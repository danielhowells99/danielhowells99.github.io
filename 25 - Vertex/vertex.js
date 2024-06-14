let sphereShader;
let postShader;
let screenbuffer;

function preload() {
  sphereShader = loadShader("sphere1.vert", "sphere1.frag");
  postShader = loadShader("post1.vert", "post1.frag");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  screenbuffer = createGraphics(windowWidth, windowHeight, WEBGL);
  screenbuffer.noStroke();
}

function draw() {
  screenbuffer.background(0);
  screenbuffer.shader(sphereShader);
  sphereShader.setUniform("uFrameCount", frameCount);
  screenbuffer.rotateY(0.5);
  screenbuffer.rotateX(0.7);
  screenbuffer.rotateX(0.007*frameCount);
  screenbuffer.sphere(height / 3, 200, 200);
  //screenbuffer.box(height / 3, 200, 200);
  
  postShader.setUniform("screen",screenbuffer)
  screenbuffer.reset()
  shader(postShader)
  rect(0,0,width,height)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
	if (keyCode === LEFT_ARROW) { //1
		noLoop()
	}
	if (keyCode === RIGHT_ARROW) { //1
		loop()
	}
}