let shader0,shader1,shader2,shader3,shader4,shader5;
let shaderTexture;
let myCanvas
let shaderIndex = 1
let shakeWait = 0

function preload() {
  // load each shader file (don't worry, we will come back to these!)
  //myShader = loadShader('shader.vert', 'shader.frag');
  shader0 = loadShader('shader.vert', 'shader0.frag');
  shader1 = loadShader('shader.vert', 'shader1.frag');
  shader2 = loadShader('shader.vert', 'shader2.frag');
  shader3 = loadShader('shader.vert', 'shader3.frag');
  shader4 = loadShader('shader.vert', 'shader4.frag');
  shader5 = loadShader('shader.vert', 'shader5.frag');
}

function setup() {
  // the canvas has to be created with WEBGL mode
  myCanvas = createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  shaderTexture = createGraphics(window.innerWidth, window.innerHeight, WEBGL)
  shaderTexture.noStroke()
  noStroke();
  
  myCanvas.mousePressed(function(){
	DeviceOrientationEvent.requestPermission();
  });
  
  setShakeThreshold(30)
}

function draw() {
	//orbitControl()
	background(0)
	
	switch (shaderIndex){
		case 0:
			shader0.setUniform('frameNumber',frameCount)
			shader0.setUniform('aspect',width/height)
			shader(shader0)
			break;
		case 1:
			shader1.setUniform('frameNumber',frameCount)
			shader1.setUniform('aspect',width/height)
			shader(shader1)
			break;
		case 2:
			shader2.setUniform('frameNumber',frameCount)
			shader2.setUniform('aspect',width/height)
			shader(shader2)
			break;
		case 3:
			shader3.setUniform('frameNumber',frameCount)
			shader3.setUniform('aspect',width/height)
			shader(shader3)
			break;
		case 4:
			shader4.setUniform('frameNumber',frameCount)
			shader4.setUniform('aspect',width/height)
			shader(shader4)
			break;
		default:
			shader5.setUniform('frameNumber',frameCount)
			shader5.setUniform('aspect',width/height)
			shader(shader5)
	}
	
	rect(0,0,width,height)
	shakeWait++
}

function keyPressed() {
	if (keyCode === 49) { //1
		shaderIndex = 0
	}
	if (keyCode === 50) { //2
		shaderIndex = 1
	}
	if (keyCode === 51) { //3
		shaderIndex = 2
	}
	if (keyCode === 52) { //4
		shaderIndex = 3
	}
	if (keyCode === 53) { //5
		shaderIndex = 4
	}
	if (keyCode === 54) { //6
		shaderIndex = 5
	}
}

function deviceShaken() {
	if (shakeWait > 30){
		shaderIndex = (shaderIndex + 1)%6
		shakeWait = 0
	}
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}