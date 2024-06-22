class Star{
	constructor(x,y,k){
		this.x = x
		this.y = y
		this.vx = 0
		this.vy = 0
		this.fx = 0
		this.fy = 0
		this.E = 0
		this.k = k
		this.active = true
	} 
}

const CANVAS_FACTOR = 2
let CANVAS_WIDTH = 0
let CANVAS_HEIGHT = 0

let ORIGINX = CANVAS_WIDTH/2
let ORIGINY = CANVAS_HEIGHT/2

let bgdColour = getComputedStyle(document.querySelector('body')).backgroundColor
//bgdColour = bgdColour.replace(/[^\d,]/g, '').split(',');

let K0 = 0.02

let M = 1000
let B = 0.98

let rad = 0.7
let s = 0

let randFactor = 0.0

let liveUpdate = false
let linesOn = false
let dotsOn = false

let equDist = 1.0

let starList = []
let starNum = 700

let borderNum = 25
let staticStars = []

let allStars = []

let attractor = 5

function setup() {
	
	CANVAS_WIDTH = windowWidth
	CANVAS_HEIGHT = windowHeight
	
	var myCanvas = createCanvas(CANVAS_WIDTH,CANVAS_HEIGHT);
	//myCanvas.parent("canvasDiv")
	background(bgdColour)
	initStars(starNum)
	//document.getElementById("canvasDiv").style.cursor = 'none';
	//submitParams()
	frameRate(60)
}	

function draw() {

	CANVAS_WIDTH = width
	CANVAS_HEIGHT = height

	ORIGINX = CANVAS_WIDTH/2
	ORIGINY = CANVAS_HEIGHT/2

	background(bgdColour)
	
	let mouseStar = new Star((width/height)*(mouseX-ORIGINX)/ORIGINX,(mouseY-ORIGINY)/ORIGINY,attractor)
	
	mouseStar.active = false
	if(mouseIsPressed && mouseX < CANVAS_WIDTH && mouseX > 0 && mouseY < CANVAS_HEIGHT && mouseY > 0){
		mouseStar.active = true
	}

	allStars.push(mouseStar)
	
	calcForces()
	updateStars()

	allStars[allStars.length-1].x = (width/height)*(mouseX-ORIGINX)/ORIGINX
	allStars[allStars.length-1].y = (mouseY-ORIGINY)/ORIGINY
	
	showStars()
	
	allStars.pop()
	s++;
}

function initStars(numStars){
	starList = []
	for(let i = 0;i<numStars;i++){
		let mag1 = Math.random()
		let angle1 = 2*PI*Math.random()
		//starList.push(new Star(rad*(2*Math.random()-1),rad*(2*Math.random()-1),K0))
		//starList.push(new Star(rad*mag1*cos(angle1),rad*mag1*sin(angle1),K0))
		starList.push(new Star(rad*mag1*cos(angle1),rad*mag1*sin(angle1),K0+randFactor*K0*(2*Math.random()-1)))
	}
	
	//staticStars.push(new Star(0,0,K0))
	//staticStars[staticStars.length-1].k = K0
	
	allStars = starList.concat(staticStars)
}

function calcForces(){
	for (let i = 0;i<allStars.length;i++){
		let xPos1 = allStars[i].x
		let yPos1 = allStars[i].y
		for (let j = i+1;j<allStars.length;j++){
			if (allStars[i].active == true && allStars[j].active == true){
				let xPos2 = allStars[j].x
				let yPos2 = allStars[j].y
				let xDisp = xPos2 - xPos1
				let yDisp = yPos2 - yPos1
				let angle = atan2(yDisp,xDisp)
				//let disp = (xDisp*xDisp + yDisp*yDisp)-equDist
				let disp = Math.sqrt(xDisp*xDisp + yDisp*yDisp)-equDist
				//let disp = abs(xDisp) + abs(yDisp) - equDist 
				let cosa = cos(angle)
				let sina = sin(angle)
				let K = allStars[i].k + allStars[j].k
				allStars[i].fx += cosa*K*disp
				allStars[j].fx += -cosa*K*disp
				allStars[i].fy += sina*K*disp
				allStars[j].fy += -sina*K*disp
				allStars[i].E += disp*disp
				allStars[j].E += disp*disp
			}
		}
	}
	
}

function updateStars(){
	for (let i = 0;i<starList.length;i++){
		let accelx = starList[i].fx/M
		let accely = starList[i].fy/M
		
		starList[i].vx = B*starList[i].vx + accelx
		starList[i].vy = B*starList[i].vy + accely
		
		starList[i].x += starList[i].vx
		starList[i].y += starList[i].vy

		starList[i].fx = 0
		starList[i].fy = 0			
	}
}
	
function showStars(){
	noStroke()
	//let energy = starList.map(a => a.E);
	let i = 0
	let scale = min(ORIGINX,ORIGINY)
	for (let star of allStars){
		let size = 3*Math.min((20*star.k),1)
		translate(ORIGINX + scale*star.x,ORIGINY + scale*star.y)
		
		fill(255,8)
		ellipse(0,0,10*size,10*size)
		fill(255,2)
		ellipse(0,0,20*size,20*size)
		fill(255)
		ellipse(0,0,size,size)
		star.E = 0
		i++;
		resetMatrix()
	}
	
}
function changeK(){
	for (let star of allStars){
		star.k = K0+randFactor*K0*(2*Math.random()-1)
	}
}

function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight);
}
