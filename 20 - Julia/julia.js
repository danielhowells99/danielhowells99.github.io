let mainFractalShader,juliaShader
let myCanvas
let pointx = 0.0,pointy = 0.0
let centerx = 8.0, centery = 10.0
let juliaCenterx = 0.0, juliaCentery = 0.0
let scale = 2.0;
let juliaZoom = 6.28;

function preload() {
  mainFractalShader = loadShader('shader.vert', 'mainFractal.frag');
  juliaShader = loadShader('shader.vert', 'julia.frag');
}

function setup() {
  myCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke()
}

function draw() {
	background(0)
	
	if (keyIsDown(69)){// e
		scale -= scale*0.01
	}
	if (keyIsDown(81)){// q
		scale += scale*0.01
	}
	if (keyIsDown(65)){// a
		centerx -= scale*0.01
	}
	if (keyIsDown(87)){// w
		centery += scale*0.01
	}
	if (keyIsDown(68)){//d
		centerx += scale*0.01
	}
	if (keyIsDown(83)){//s
		centery -= scale*0.01
	}
	
	if (keyIsDown(85)){// u
		juliaZoom += juliaZoom*0.01
	}
	if (keyIsDown(79)){// o
		juliaZoom -= juliaZoom*0.01
	}
	if (keyIsDown(76)){// l
		juliaCenterx += juliaZoom*0.01
	}
	if (keyIsDown(74)){// j
		juliaCenterx -= juliaZoom*0.01
	}
	if (keyIsDown(73)){// i
		juliaCentery += juliaZoom*0.01
	}
	if (keyIsDown(75)){// k
		juliaCentery -= juliaZoom*0.01
	}
	
	pointx = scale*(4.0*mouseX/width - 1.0) + centerx;
	pointy = scale*(1.0 - 2.0*mouseY/height) + centery;
	
	mainFractalShader.setUniform('leftHalf',1.0)
	mainFractalShader.setUniform('frameNumber',frameCount)
	mainFractalShader.setUniform('aspect',0.5*width/height)
	mainFractalShader.setUniform('pointOfInterest',[pointx,pointy])
	mainFractalShader.setUniform('centerPoint',[centerx,centery])
	
	
	mainFractalShader.setUniform('scale',scale)
	
	shader(mainFractalShader)
	rect(-width/2,-height/2,width/2,height)	
	
	juliaShader.setUniform('leftHalf',0.0)
	juliaShader.setUniform('frameNumber',frameCount)
	juliaShader.setUniform('aspect',0.5*width/height)
	juliaShader.setUniform('pointOfInterest',[pointx,pointy])
	juliaShader.setUniform('zoom',juliaZoom)
	juliaShader.setUniform('juliaCenter',[juliaCenterx, juliaCentery])
	
	shader(juliaShader)
	rect(0,-height/2,width/2,height)	
}

function keyPressed() {

}