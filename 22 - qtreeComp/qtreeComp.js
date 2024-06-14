let myCanvas
let myTree
let img
let count = 0

const MAX_DISTORTION = 40

class BoundingBox{
	constructor(pixelOffsetX,pixelOffsetY,pixelPerSide){
		this.pixelOffsetX = pixelOffsetX
		this.pixelOffsetY = pixelOffsetY
		this.pixelPerSide = pixelPerSide
	}
	
	computeAvgCol(){
		let col = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSide,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSide,img.height)
		
		//console.log(this.pixelOffsetX,this.pixelOffsetY,upperboundX,upperboundY)
		
		for (let i = this.pixelOffsetX; i < upperboundX; i++) {
			for (let j = this.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i);
				col += img.pixels[index]
				//console.log(col)
			}
		}
		//console.log(col)
		return col/((upperboundX-this.pixelOffsetX)*(upperboundY-this.pixelOffsetY))
	} 
	
	distortion(colour){
		let dis = 0
		let upperboundX = min(this.pixelOffsetX+this.pixelPerSide,img.width)
		let upperboundY = min(this.pixelOffsetY+this.pixelPerSide,img.height)
		for (let i = this.pixelOffsetX; i < upperboundX; i++) {
			for (let j = this.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i);
				let sqd = (img.pixels[index]-colour)
				dis += (sqd*sqd)
			}
		}
		return dis/((upperboundX-this.pixelOffsetX)*(upperboundY-this.pixelOffsetY))
	}
}	

class QTree{
	
	constructor(bb){
		this.bb = bb
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
		let newPixelsPerSide = int(this.bb.pixelPerSide/2.0)
		
		this.subtreeNW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY,newPixelsPerSide))
		this.subtreeNE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSide,this.bb.pixelOffsetY,newPixelsPerSide))
		this.subtreeSW = new QTree(new BoundingBox(this.bb.pixelOffsetX,this.bb.pixelOffsetY + newPixelsPerSide,newPixelsPerSide))
		this.subtreeSE = new QTree(new BoundingBox(this.bb.pixelOffsetX + newPixelsPerSide,this.bb.pixelOffsetY + newPixelsPerSide,newPixelsPerSide))
		
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
		this.colour = this.bb.computeAvgCol()
		this.distortion = this.bb.distortion(this.colour)
		//console.log(this)
		//console.log("checking: " + this.name + "\ncolour:" + this.colour + "\ndist:" + this.distortion)
		//console.log(this.bb.colour)
		//console.log(this.distortion)
		
		if ((this.distortion < this.maxDistortion) && (this.subtreeNW == null)){
			//console.log("acceptable dist: " + this.name)
			return false;
		}
		
		if (this.depth > 8){
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
	strokeWeight(0.5)
	//noStroke()
	stroke(255)
	
	let x = tree.bb.pixelOffsetX/img.width*width
	let y = tree.bb.pixelOffsetY/img.height*height
	let w = tree.bb.pixelPerSide/img.height*height
	
	if (tree.subtreeNW == null){
		strokeWeight(0.2)
		//ellipse(x,y,10,10)
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
	if (tree.subTreeNW == null){
		//console.log("drawing: " + tree.name)
		let upperboundX = min(tree.bb.pixelOffsetX+tree.bb.pixelPerSide,img.width)
		let upperboundY = min(tree.bb.pixelOffsetY+tree.bb.pixelPerSide,img.height)
		//console.log(tree.bb.pixelOffsetX,tree.bb.pixelOffsetY,upperboundX,upperboundY)
		for (let i = tree.bb.pixelOffsetX; i < upperboundX; i++) {
			for (let j = tree.bb.pixelOffsetY; j < upperboundY; j++) {
				let index = 4*(j*img.width+i);
				img.pixels[index] = tree.colour
				img.pixels[index+1] = tree.colour
				img.pixels[index+2] = tree.colour
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
	img = loadImage('test4.png');
	//img = loadImage('target17.png');
	//img = loadImage('peony.png');
}

function setup() {
	myCanvas = createCanvas(img.width, img.height);
	img.pixelDensity(1)
	img.loadPixels()
}

function draw() {
	
	background(0,70)
	myTree = new QTree((new BoundingBox(0,0,img.width)))
	
	myTree.checkDistortion()
	
	stroke(255,100)
	//drawTree(myTree)
	drawTree2(myTree)

	img.updatePixels()
	tint(255,255,255,100)
	let scaleFactor = min(height/img.height,width/img.width)
	//scale(scaleFactor)
	image(img,0,0)
	
	//printTree(myTree)
	noLoop();
}