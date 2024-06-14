//PUT BASS IN MIDDLE

const CANVAS_WIDTH = window.innerWidth
const CANVAS_HEIGHT = window.innerHeight
const ORIGINX = CANVAS_WIDTH/2.0
const ORIGINY = CANVAS_HEIGHT/2.0

const NUM_POINTS = 120
const STROKE_WEIGHT = 0.02
const SKIPS = 2

let myCanvas

let anim = 0
let framerate = 960

let mic,fft,spectrum,buckets
let micToggle = false

let xCoords = []
let yCoords = []
let vx = []
let vy = []

function initPointList(n){
	for (let i=0;i<n;i++){
		xCoords.push(-1 + 2*Math.random())
		yCoords.push(-1 + 2*Math.random())
		let angle = 2*PI*Math.random()
		vx.push(0.005*((i+1)/n)*cos(angle))
		vy.push(0.005*((i+1)/n)*sin(angle))
	}
}

function initPointList2(n){
	for (let i=0;i<n;i++){
		let angle = 2*PI*Math.random()
		xCoords.push((n-i)/n*cos(angle))
		yCoords.push((n-i)/n*sin(angle))
		vx.push(0)
		vy.push(0)
	}
}

function drawMesh(){
	translate(ORIGINX,ORIGINY)
	stroke(255)
	strokeWeight(STROKE_WEIGHT)
	for (let i = xCoords.length-1; i >= 0;i--){
		xCoords[i] = (xCoords[i] + vx[i])
		yCoords[i] = (yCoords[i] + vy[i])
		if (xCoords[i] > 1 || xCoords[i] < -1){vx[i]*=-1}
		if (yCoords[i] > 1 || yCoords[i] < -1){vy[i]*=-1}
		//let col1 = getColour(spectrum[scaleIndex(i)]/128)
		let col1 = getColour(buckets[i]/128)
		//let col1 = getColour((0.5+0.5*i/xCoords.length)*buckets[i]/128)
		fill(col1)
		let x1 = ORIGINX*xCoords[i]
		let y1 = ORIGINY*yCoords[i]
		//noStroke()
		//ellipse(x1,y1,10,10)
		//stroke(255)
		for (let j=i; j >= 0;j = j-SKIPS){

			let x2 = ORIGINX*xCoords[j]
			let y2 = ORIGINY*yCoords[j]

			
			//let col2 = getColour(spectrum[scaleIndex(j)]/128)
			let col2 = getColour(buckets[j]/128)
			//let col2 = getColour((0.5+0.5*j/xCoords.length)*buckets[j]/128)
			gradientLine(x1,y1,x2,y2,col1,col2)

			/*
			let val = (spectrum[scaleIndex(j)] + spectrum[scaleIndex(i)])/512
			stroke(255,100*val)
			line(x1,y1,x2,y2)
			*/
		}
	}
}

function scaleIndex(i){
	return floor(spectrum.length*(i*i)/(xCoords.length*xCoords.length))
	//return floor(spectrum.length*i/xCoords.length)
}

function gradientLine(x1, y1, x2, y2, color1, color2) {
  // linear gradient from start to end of line
  var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);

  this.drawingContext.strokeStyle = grad;

  line(x1, y1, x2, y2);
}

function getColour(val){
	//colorMode(HSB)
	//return color((270+val*360)%360,70+30*sin(2*PI*val + PI/2),60-40*sin(2*PI*val + PI/2))
	//return color((270+val*360)%360,70+30*cos(2*PI*val),60-40*cos(2*PI*val)) //GOOD
	val*=0.7
	return color((270+val*val*360)%360,70+30*cos(2*PI*val*val),60-40*cos(2*PI*val*val)) //GOOD
	//return color((val*val*30)%360,150-50*val*val,10+50*val*val)
}

function preload(){
	initPointList(NUM_POINTS)
	//initPointList2(NUM_POINTS)
}


function setup() {
	myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	myCanvas.parent("canvasDiv")
	
	fft = new p5.FFT(0.6);
	
	mic = new p5.AudioIn();
	mic.connect()

	spectrum = fft.analyze();
	
	frameRate(30);
}

function draw() {
	//blendMode(HARD_LIGHT)
	spectrum = fft.analyze();
	buckets = fft.linAverages(NUM_POINTS)
	//buckets = fft.logAverages(fft.getOctaveBands(7))
	colorMode(HSB)
	//background(195,60,0,0.4)
	background(0,0.3)
	//clear()
	
	anim = 1+frameCount/framerate
	drawMesh()
	//console.log(buckets.length)
	filter(DILATE)
	//filter(BLUR,12)
	//noLoop();
}

function nudgeTheLines(){
	translate(0,ORIGINY)
	stroke(255)
	strokeWeight(0.4)
	for (let i = 0; i < spectrum.length;i=i+2){
		translate(2*CANVAS_WIDTH/spectrum.length,0)
		let rotVal = 3*(-1 + spectrum[i]/128)
		translate(rotVal,0)
		line(0,-ORIGINY,0,ORIGINY)
		//translate(-rotVal,0)
		
	}
}

function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		noLoop()
	}		
	if (keyCode === RIGHT_ARROW) {
		loop()
	}		
	if (keyCode === TAB) {
		getAudioContext().resume();
	}
	if (keyCode === 77) { //m
		if (micToggle == false){
			getAudioContext().resume();
			micToggle = true
			mic.start();
		} else {
			micToggle = false
			mic.stop();
		}
	}
}