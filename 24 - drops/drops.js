const CANVAS_WIDTH = window.innerWidth
const CANVAS_HEIGHT = window.innerHeight
const ORIGINX = CANVAS_WIDTH/2.0
const ORIGINY = CANVAS_HEIGHT/2.0

const NUM_POINTS = 22
const STROKE_WEIGHT = 1
const MAX_RIPPLES = 24

let myCanvas

let anim = 0
let framerate = 960

let mic,fft,spectrum,buckets
let micToggle = false

let textToggle = false
let textTime = 0.0

let logToggle = true

let ripple_threshold = 110;

/*
let BGD_COL = getComputedStyle(document.querySelector('body')).backgroundColor
BGD_COL = BGD_COL.replace(/[^\d,]/g, '').split(',');
*/
let bs = 0

let dropList = []

class Ripple {
	constructor(x,y,r,freq,value){
		this.x = x
		this.y = y 
		this.r = r
		this.freq = freq
		if (logToggle){
			this.value = 1/(1+Math.pow(3,10*((0.9-0.9*freq)-value*value)))
		} else {
			this.value = 1/(1+Math.pow(3,10*((0.2-0.5*freq*freq)-value*value)))
		}
	}
	
	drawRipple(num){
		this.r += 0.02 + 0.005*this.freq
		//stroke((270+this.value*this.value*360)%360,70+30*cos(2*PI*this.value*this.value),60-40*cos(2*PI*this.value*this.value),1-this.r/RIPPLE_THRESHOLD)
		//stroke((270+this.value*this.value*360)%360,70+30*cos(2*PI*this.value*this.value),60-40*cos(2*PI*this.value*this.value),(num)*(1-0.05*this.r/(this.freq*this.value)))
		//stroke(100,1-0.1*this.r/(log(1+this.freq)*this.value))
		//stroke(255*(0.5+0.5*cos(6.28*(this.value+0.5))),255*(0.5+0.5*cos(6.28*(this.value+0.6))),255*(0.5+0.5*cos(6.28*(this.value+0.7))),255*(1+this.value)*num/(1+5*this.r))
		//stroke(360*this.freq,100,100,(num)*(1-0.1*this.r/(this.freq+this.value)))
		//stroke(360*this.freq,100,100)
		stroke((270+this.value*180)%360,60+40*cos(3.14*this.value),60-40*cos(3.14*this.value),(1+5*this.value)*num/(1+6*this.r))
		//stroke(100*this.value,(1+5*this.value)*num/(1+10*this.r))
		ellipse(ORIGINX*this.x,ORIGINY*this.y,ORIGINY*this.r,ORIGINY*this.r)
	}
}

class Droplet {
	
	constructor(x,y,freq){
		this.x = x
		this.y = y 
		this.freq = freq
		let angle = 2*PI*Math.random()
		this.vx = (0.01*freq*cos(angle))
		this.vy = (0.01*freq*sin(angle))
		this.ripples = []
		this.counter = 0
	}
	
	addRipple(val){
		this.ripples.push(new Ripple(this.x,this.y,0,this.freq,val))
	}
	
	drawRipples(){
		
		this.counter++
		
		if (this.ripples.length > MAX_RIPPLES){
			this.ripples.shift()
		}
		
		if (this.ripples.length > 0){
			if (this.ripples[this.ripples.length-1].r>0.4){
				this.ripples.shift()
			}
		}
		
		for (let i = 0; i <  this.ripples.length; i++){
			this.ripples[i].drawRipple(i/this.ripples.length)
		}
		
		this.x += this.vx
		this.y += this.vy
		if (this.x > 1 || this.x < -1){this.vx*=-1}
		if (this.y > 1 || this.y < -1){this.vy*=-1}
	}
}

function initRipples(n){
	for (let i=0;i<n;i++){
		let xCoord = -1 + 2*Math.random()
		let yCoord = -1 + 2*Math.random()
		dropList.push(new Droplet(xCoord,yCoord,(i+1)/n))
	}
}

function preload(){
	initRipples(NUM_POINTS)
}

function fireDrops(){
	//let numRips = 0
	for (let i=0;i<dropList.length;i++){
		let d = dropList[i]
		let val = buckets[i]
		let rthres = ripple_threshold*(1.4 - 1.3*i/dropList.length)
		if (val > rthres){
			d.addRipple((val-rthres)/(255-rthres))
			//d.addRipple(val*val)
			//numRips += d.ripples.length
		}
		d.drawRipples()
	}
	//console.log(numRips)
}

function setup() {
	myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	myCanvas.parent("canvasDiv")
	
	fft = new p5.FFT(0.4);
	
	mic = new p5.AudioIn();
	mic.connect()

	spectrum = fft.analyze();
	
	//bs = color(BGD_COL[0],BGD_COL[1],BGD_COL[2],90)
	
	frameRate(30);
}

function draw() {
	//blendMode(HARD_LIGHT)
	push()
	colorMode(HSB)
	//background(bs)
	background(0,0.5)
	
	spectrum = fft.analyze();
	if (logToggle){
		ripple_threshold = 190
		buckets = fft.logAverages(fft.getOctaveBands(2))
	} else {
		ripple_threshold = 120
		buckets = fft.linAverages(NUM_POINTS)
	}
	//
	
	translate(ORIGINX,ORIGINY)
	noFill()
	strokeWeight(STROKE_WEIGHT)
	fireDrops()
	
	if (textToggle){
		textTime = 1.0
	}
	
	if (textTime > 0){
		resetMatrix()
		stroke(0,(textTime))
		strokeWeight(1)
		fill(100,(textTime))
		textSize(35)
		text("t: toggle text - " + textToggle + "\n"
		+ "ripple_threshold - " + ripple_threshold.toFixed(3) + "\n" 
		+ "l: toggle log - " + logToggle + "\n"
		+ "m: toggle mic - " + micToggle + "\n"
		+ "<-/->: play/pause",50,50)
		textTime = Math.max(textTime-1/30.0,0)
	}
	
	
	//console.log(buckets.length)
	pop()
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
	if (keyCode === 84) { //t
		if (textToggle == false){
			textToggle = true
		} else {
			textToggle = false
		}
	}	
	if (keyCode === 76) { //l
		if (logToggle == false){
			logToggle = true
		} else {
			logToggle = false
		}
	}
}