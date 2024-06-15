let myCanvas
let c = 0

function preload() {
}

function setup() {
  // the canvas has to be created with WEBGL mode
  myCanvas = createCanvas(window.innerWidth, window.innerHeight);
  shaderTexture = createGraphics(window.innerWidth, window.innerHeight)
  shaderTexture.noStroke()
  noStroke();
}

function draw() {
	background(255*c)
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function deviceShaken() {
	c = (c + 0.25)%2
}