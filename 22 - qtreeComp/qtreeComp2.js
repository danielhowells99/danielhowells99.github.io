let myCanvas
let myTreeR
let myTreeG
let myTreeB
let img
let img2
let count = 0

const MAX_DISTORTION = 50
const MAX_DEPTH = 7
const COLOUR_RES = 64

class BoundingBox{
	constructor(pixelOffsetX,pixelOffsetY,pixelPerSideX,pixelPerSideY){
		this.pixelOffsetX = pixelOffsetX
		this.pixelOffsetY = pixelOffsetY
		this.pixelPerSideX = pixelPerSideX
		this.pixelPerSideY = pixelPerSideY
	}
	
	//Compute average colour value (0 -> 255) for selected colour channel (0: red, 1: green, 2: blue)
	computeAvgCol(colourChannel){
		let col = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSideX,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSideY,img.height)
		
		for (let i = this.pixelOffsetX; i < upperboundX; i++) {
			for (let j = this.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i)+colourChannel;
				col += img.pixels[index]
			}
		}
		return col/((upperboundX-this.pixelOffsetX)*(upperboundY-this.pixelOffsetY))
	} 
	
	//compute square distortion for box
	distortion(colour,colourChannel){
		let dis = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSideX,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSideY,img.height)
		for (let i = this.pixelOffsetX; i < upperboundX; i++) {
			for (let j = this.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i) + colourChannel;
				let sqd = (img.pixels[index]-colour)
				dis += (sqd*sqd)
			}
		}
		return dis/((upperboundX-this.pixelOffsetX)*(upperboundY-this.pixelOffsetY))
	}
}	

class QTree{
	
	constructor(bb,colourChannel){
		this.bb = bb
		this.colourChannel = colourChannel
		this.subtreeNW = null 
		this.subtreeNE = null
		this.subtreeSW = null
		this.subtreeSE = null
		this.maxDistortion = MAX_DISTORTION
		this.distortion = 0
		this.colour = 255
		this.depth = 0
		this.name = "root"
	}
	
	//create leaves
	subdivide(){
		let newPixelsPerSideX = this.bb.pixelPerSideX/2.0
		let newPixelsPerSideY = this.bb.pixelPerSideY/2.0
		let fudgeX = 0
		let fudgeY = 0
		if (newPixelsPerSideX%1 != 0){
			fudgeX = 1
		}
		if (newPixelsPerSideY%1 != 0){
			fudgeY = 1
		}
		newPixelsPerSideX = floor(newPixelsPerSideX)
		newPixelsPerSideY = floor(newPixelsPerSideY)
		
		this.subtreeNW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY,newPixelsPerSideX+fudgeX,newPixelsPerSideY+fudgeY),this.colourChannel)
		this.subtreeNE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSideX + fudgeX,this.bb.pixelOffsetY,newPixelsPerSideX,newPixelsPerSideY+fudgeY),this.colourChannel)
		this.subtreeSW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY + newPixelsPerSideY + fudgeY,newPixelsPerSideX+fudgeX,newPixelsPerSideY),this.colourChannel)
		this.subtreeSE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSideX + fudgeX,this.bb.pixelOffsetY + newPixelsPerSideY + fudgeY,newPixelsPerSideX,newPixelsPerSideY),this.colourChannel)
		
		this.subtreeNW.depth = this.depth + 1
		this.subtreeNE.depth = this.depth + 1
		this.subtreeSW.depth = this.depth + 1
		this.subtreeSE.depth = this.depth + 1

		this.subtreeNW.name = "NW" + this.depth
		this.subtreeNE.name = "NE" + this.depth
		this.subtreeSW.name = "SW" + this.depth
		this.subtreeSE.name = "SE" + this.depth
	}
	
	checkDistortion(){
		this.colour = this.bb.computeAvgCol(this.colourChannel)
		this.distortion = this.bb.distortion(this.colour,this.colourChannel)
		
		//Acceptable Distortion
		if ((this.distortion < this.maxDistortion) && (this.subtreeNW == null)){
			return false;
		}
		
		//Max depth reached
		if (this.depth > MAX_DEPTH){
			return false
		}
		
		//Subdividing
		if (this.subtreeNW == null){
			this.subdivide()
		}
		
		this.subtreeSW.checkDistortion()
		this.subtreeSE.checkDistortion()
		this.subtreeNE.checkDistortion()
		this.subtreeNW.checkDistortion()
		
		return false;
	}
}

//print entire tree to console
function printTree(tree){
	console.log(tree.name)
	console.log(tree)
	if (!(tree.subtreeSW==null)){
		printTree(tree.subtreeSW)
		printTree(tree.subtreeSE)
		printTree(tree.subtreeNE)
		printTree(tree.subtreeNW)
	}
	return false
}

//draw tree as wire frame
function drawTree(tree){
	push()
	resetMatrix()
	//translate(-width/2,-height/2,50-50*cos(frameCount*0.1)*tree.depth)
	//translate(-width/2,-height/2)
	//noStroke()
	blendMode(ADD)
	switch (tree.colourChannel){
		case 0:
			//stroke(50 + 0.8*tree.colour,0,0)
			stroke(tree.colour,0,0)
			//stroke(tree.colour,0,0,83)
			fill(tree.colour,0,0)
			//stroke(255,0,0,tree.colour)
			//stroke(255,0,0)
			break;
		case 1:
			//stroke(0,50 + 0.8*tree.colour,0)
			stroke(0,tree.colour,0)
			//stroke(0,tree.colour,0,83)
			fill(0,tree.colour,0)
			//stroke(0,255,0,tree.colour)
			//stroke(0,255,0)
			break;
		case 2:
			//stroke(0,0,50 + 0.8*tree.colour)
			stroke(0,0,tree.colour)
			//stroke(0,0,tree.colour,83)
			fill(0,0,tree.colour)
			//stroke(0,0,255,tree.colour)
			//stroke(0,0,255)
			break;
		default:
			stroke(255)
			break;
	}
	
	
	let x = tree.bb.pixelOffsetX/img.width*width
	let y = tree.bb.pixelOffsetY/img.height*height
	let wx = tree.bb.pixelPerSideX/img.width*width
	let wy = tree.bb.pixelPerSideY/img.height*height
	
	if (tree.subtreeNW == null){
		strokeWeight(1)
		//noStroke()
		//ellipse(x+wx/2,y+wy/2,wx,wy)
		//fill(tree.colour,140)
		noFill()
		rect(x,y,wx,wy)
		//console.log(count+ ": " + x + ", " + y + ", " + w)
		//textAlign(CENTER)
		//textSize(40/(tree.depth+1))
		//fill(tree.colour)
		//text(count,x+w/2,y+w/2)
		//text(tree.name,x+w/2,y+w/2)
	}
	count++
	
	if (!(tree.subtreeNW == null)){
		drawTree(tree.subtreeNW)
		drawTree(tree.subtreeNE)
		drawTree(tree.subtreeSW)
		drawTree(tree.subtreeSE)
	}
	pop()
}

//write image according to tree
function drawTree2(tree){
	//tree.colour = 255*floor(COLOUR_RES*tree.colour/255)/COLOUR_RES
	if (tree.subTreeNW == null){
		let upperboundX = min(tree.bb.pixelOffsetX+tree.bb.pixelPerSideX,img.width)
		let upperboundY = min(tree.bb.pixelOffsetY+tree.bb.pixelPerSideY,img.height)
		for (let i = tree.bb.pixelOffsetX; i < upperboundX; i++) {
			for (let j = tree.bb.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i) + tree.colourChannel;
				img.pixels[index] = tree.colour
			}
		}
	}
	if (tree.subtreeNW != null){
		drawTree2(tree.subtreeNW)
		drawTree2(tree.subtreeNE)
		drawTree2(tree.subtreeSW)
		drawTree2(tree.subtreeSE)
	}
}

function preload(){
	//img = loadImage('target4b.png');
	img = loadImage('test4.png');
	//img = loadImage('target17.png');
	//img = loadImage('duck.png');
}

function setup() {
	//myCanvas = createCanvas(img.width, img.height,WEBGL);
	myCanvas = createCanvas(img.width, img.height);
	img.pixelDensity(1)
	img.loadPixels()
	
	myTreeR = new QTree((new BoundingBox(0,0,img.width,img.width)),0)
	myTreeG = new QTree((new BoundingBox(0,0,img.width,img.width)),1)
	myTreeB = new QTree((new BoundingBox(0,0,img.width,img.width)),2)
	
	myTreeR.checkDistortion()
	myTreeG.checkDistortion()
	myTreeB.checkDistortion()
}

function draw() {
	//orbitControl()
	background(0)
	
	/*
	drawTree2(myTreeR)
	drawTree2(myTreeB)
	drawTree2(myTreeG)
	*/
	

	img.updatePixels()
	tint(255,255,255,100)
	let scaleFactor = min(height/img.height,width/img.width)
	//scale(scaleFactor)
	//image(img,0,0)
	
	
	drawTree(myTreeG)
	drawTree(myTreeB)
	drawTree(myTreeR)
	
	
	//filter(BLUR,1)
	
	//printTree(myTree)
	noLoop();
}