let img
let crop

let dim

function preload(){
	img = loadImage('download.png')
}


function setup() {
	dim = min(img.width, img.height)
	myCanvas = createCanvas(800,800);
	crop = createGraphics(dim,dim);
	
	crop.pixelDensity(1)
	
	myCanvas.parent("canvasDiv")
}

function draw() {
	//background(0,0,255)
	//darken(img,0.5)
	//img.filter(THRESHOLD,0.1)
	crop.copy(img,0.5*(img.width-img.height),0,img.height,img.height,0,0,dim,dim)
	makeCircle(crop,0.8)
	alphaMask(crop)
	imageMode(CENTER)
	//scale(800/crop.width)
	let scaleVal = 1
	image(crop,400,400,scaleVal*800,scaleVal*800)
	
	noLoop()
}

function makeCircle(graphic,rad){
	graphic.loadPixels();
	//graphic.colorMode(HSB)
	for (let i = 0; i < graphic.width; i++) {
		for (let j = 0; j < graphic.height; j++) {
			// loop over
			let xPos = 2*(i/graphic.width - 0.5)
			let yPos = 2*(j/graphic.height - 0.5)
			if (xPos*xPos + yPos*yPos >= rad){
				let index = 4*(j*graphic.width+i);
				graphic.pixels[index] = pixels[index]
				graphic.pixels[index+1] = pixels[index+1]
				graphic.pixels[index+2] = pixels[index+2]
				graphic.pixels[index+3] = 0;
			}
		}
	}
	graphic.updatePixels();
}

function alphaMask(graphic){
	graphic.loadPixels();
	for (let i = 0; i < graphic.width; i++) {
		for (let j = 0; j < graphic.height; j++) {
			let index = 4*(j*graphic.width+i);
			graphic.pixels[index+3] = (graphic.pixels[index] + graphic.pixels[index+1] + graphic.pixels[index+2])/3.0;
			graphic.pixels[index] = 255
			graphic.pixels[index+1] = 255
			graphic.pixels[index+2] = 255
			
		}
	}
	graphic.updatePixels();
}

function darken(graphic,val){
	graphic.loadPixels();
	for (let i = 0; i < graphic.width; i++) {
		for (let j = 0; j < graphic.height; j++) {
			let index = 4*(j*graphic.width+i);
			graphic.pixels[index] = graphic.pixels[index]*val
			graphic.pixels[index+1] = graphic.pixels[index+1]*val
			graphic.pixels[index+2] = graphic.pixels[index+2]*val
		}
	}
	graphic.updatePixels();
}