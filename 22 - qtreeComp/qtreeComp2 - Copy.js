let myCanvas
let myTreeR
let myTreeG
let myTreeB
let img
let img2
let count = 0

const MAX_DISTORTION = 500
const MAX_DEPTH = 6
const COLOUR_RES = 64

class BoundingBox{
	constructor(pixelOffsetX,pixelOffsetY,pixelPerSide){
		this.pixelOffsetX = pixelOffsetX
		this.pixelOffsetY = pixelOffsetY
		this.pixelPerSide = pixelPerSide
	}
	
	computeAvgCol(colourChannel){
		let col = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSide,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSide,img.height)
		
		//console.log(this.pixelOffsetX,this.pixelOffsetY,upperboundX,upperboundY)
		
		for (let i = this.pixelOffsetX; i < upperboundX; i++) {
			for (let j = this.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i)+colourChannel;
				col += img.pixels[index]
				//console.log(col)
			}
		}
		//console.log(col)
		return col/((upperboundX-this.pixelOffsetX)*(upperboundY-this.pixelOffsetY))
	} 
	
	distortion(colour,colourChannel){
		let dis = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSide,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSide,img.height)
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
	
	subdivide(){
		let newPixelsPerSide = this.bb.pixelPerSide/2.0
		let fudge = 1
		if (newPixelsPerSide%1 == 0){
			fudge = 0
		}
		newPixelsPerSide = floor(newPixelsPerSide)
		
		this.subtreeNW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY,newPixelsPerSide+fudge),this.colourChannel)
		this.subtreeNE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSide + fudge,this.bb.pixelOffsetY,newPixelsPerSide),this.colourChannel)
		this.subtreeSW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY + newPixelsPerSide + fudge,newPixelsPerSide),this.colourChannel)
		this.subtreeSE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSide + fudge,this.bb.pixelOffsetY + newPixelsPerSide + fudge,newPixelsPerSide),this.colourChannel)
		
		this.subtreeNW.depth = this.depth + 1
		this.subtreeNE.depth = this.depth + 1
		this.subtreeSW.depth = this.depth + 1
		this.subtreeSE.depth = this.depth + 1

		this.subtreeNW.name = "NW" + this.depth
		this.subtreeNE.name = "NE" + this.depth
		this.subtreeSW.name = "SW" + this.depth
		this.subtreeSE.name = "SE" + this.depth

		//this.distortion = 0
	}
	
	checkDistortion(){
		this.colour = this.bb.computeAvgCol(this.colourChannel)
		this.distortion = this.bb.distortion(this.colour,this.colourChannel)
		//console.log(this)
		//console.log("checking: " + this.name + "\ncolour:" + this.colour + "\ndist:" + this.distortion)
		//console.log(this.bb.colour)
		//console.log(this.distortion)
		
		if ((this.distortion < this.maxDistortion) && (this.subtreeNW == null)){
			//console.log("acceptable dist: " + this.name)
			return false;
		}
		
		if (this.depth > MAX_DEPTH){
			//console.log("max depth: " + this.name)
			return false
		}
		
		if (this.subtreeNW == null){
			//console.log("subdividing")
			this.subdivide()
		}
		
		this.subtreeSW.checkDistortion()
		this.subtreeSE.checkDistortion()
		this.subtreeNE.checkDistortion()
		this.subtreeNW.checkDistortion()
		
		
		
		return false;
	}
}

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

function drawTree(tree){
	push()
	resetMatrix()
	strokeWeight(1)
	//noStroke()
	switch (tree.colourChannel){
		case 0:
			//stroke(50 + 0.8*tree.colour,0,0)
			//stroke(tree.colour,0,0)
			//stroke(tree.colour,0,0,80)
			//fill(tree.colour,0,0,80)
			//stroke(255,0,0,83)
			stroke(255,0,0)
			break;
		case 1:
			//stroke(0,50 + 0.8*tree.colour,0)
			//stroke(0,tree.colour,0)
			//stroke(0,tree.colour,0,80)
			//fill(0,tree.colour,0,80)
			//stroke(0,255,0,83)
			stroke(0,255,0)
			break;
		case 2:
			//stroke(0,0,50 + 0.8*tree.colour)
			//stroke(0,0,tree.colour)
			//stroke(0,0,tree.colour,80)
			//fill(0,0,tree.colour,80)
			//stroke(0,0,255,83)
			stroke(0,0,255)
			break;
		default:
			stroke(255)
			break;
	}
	
	
	let x = tree.bb.pixelOffsetX/img.width*width
	let y = tree.bb.pixelOffsetY/img.height*height
	let w = tree.bb.pixelPerSide/img.height*height
	
	if (tree.subtreeNW == null){
		strokeWeight(0.2)
		//ellipse(x+w/2,y+w/2,w,w)
		//fill(tree.colour,140)
		noFill()
		rect(x,y,w,w)
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

function drawTree2(tree){
	//console.log("draw")
	//tree.colour = 255*floor(COLOUR_RES*tree.colour/255)/COLOUR_RES
	if (tree.subTreeNW == null){
		//console.log("drawing: " + tree.name)
		let upperboundX = min(tree.bb.pixelOffsetX+tree.bb.pixelPerSide,img.width)
		let upperboundY = min(tree.bb.pixelOffsetY+tree.bb.pixelPerSide,img.height)
		//console.log(tree.bb.pixelOffsetX,tree.bb.pixelOffsetY,upperboundX,upperboundY)
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
	//img = loadImage('test4.png');
	//img = loadImage('target17.png');
	img = loadImage('duck.png');
	//img = loadImage('p95.png');
}

function setup() {
	myCanvas = createCanvas(img.width, img.height);
	img.pixelDensity(1)
	img.loadPixels()
}

function draw() {
	
	background(0)
	myTreeR = new QTree((new BoundingBox(0,0,img.width)),0)
	myTreeG = new QTree((new BoundingBox(0,0,img.width)),1)
	myTreeB = new QTree((new BoundingBox(0,0,img.width)),2)
	
	myTreeR.checkDistortion()
	myTreeG.checkDistortion()
	myTreeB.checkDistortion()
	
	
	
	//drawTree(myTreeG)
	drawTree(myTreeB)
	//drawTree(myTreeR)
	
	
	
	
	/*
	drawTree2(myTreeR)
	drawTree2(myTreeB)
	drawTree2(myTreeG)
	

	img.updatePixels()
	tint(255,255,255)
	let scaleFactor = min(height/img.height,width/img.width)
	//scale(scaleFactor)
	image(img,0,0)
	*/
	
	

	
	
	
	//filter(BLUR,1)
	
	//printTree(myTree)
	noLoop();
}