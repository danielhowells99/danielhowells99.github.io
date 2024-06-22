let myCanvas
let myTree
let particleList = []

const MAX_POINTS = 2

let BGD_COL = getComputedStyle(document.querySelector('body')).backgroundColor
BGD_COL = BGD_COL.replace(/[^\d,]/g, '').split(',');
let bc = 0

class Particle{
	constructor(p,v,r){
		this.p = p
		this.v = v
		this.r = r
	}
	
	updatePosition(){
		this.p.x += this.v.x
		this.p.y += this.v.y
	}
	
	updateVelocity(){
		let dx = (this.p.x - mouseX)/windowWidth
		let dy = (this.p.y - mouseY)/windowHeight
		let dist = dx*dx + dy*dy
		let angle = atan2(dy,dx)
		this.v.x = Math.min(Math.max(0.99*this.v.x + 0.001*cos(angle)/dist,-5),5)
		this.v.y = Math.min(Math.max(0.99*this.v.y + 0.001*sin(angle)/dist,-5),5)
	}
	
	wallCollision(xmin,ymin,xmax,ymax){
		if (this.p.x < xmin){
			this.v.x *= -1
			this.p.x = xmin
		}
		if (this.p.x > xmax){
			this.v.x *= -1
			this.p.x = xmax
		}
		if (this.p.y < ymin){
			this.v.y *= -1
			this.p.y = ymin
		}
		if (this.p.y > ymax){
			this.v.y *= -1
			this.p.y = ymax
		}
	}
	
	
}

class PointOfIntrest{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

class BoundingBox{
	constructor(center,halfSideLength){
		this.center = center
		this.halfSideLength = halfSideLength
	}
	
	containsPoint(p){
		return ((p.x > this.center.x - this.halfSideLength) && (p.x < this.center.x + this.halfSideLength) && (p.y > this.center.y - this.halfSideLength) && (p.y < this.center.y + this.halfSideLength))
	}
}

class QTree{
	
	constructor(bb){
		this.bb = bb
		this.points = []
		this.subtreeNW = null
		this.subtreeNE = null
		this.subtreeSW = null
		this.subtreeSE = null
		this.maxPoints = MAX_POINTS
		this.depth = 0
	}
	
	subdivide(){
		this.subtreeNW = new QTree(new BoundingBox(new PointOfIntrest(this.bb.center.x - this.bb.halfSideLength*0.5,this.bb.center.y - this.bb.halfSideLength*0.5),this.bb.halfSideLength*0.5))
		this.subtreeNE = new QTree(new BoundingBox(new PointOfIntrest(this.bb.center.x + this.bb.halfSideLength*0.5,this.bb.center.y - this.bb.halfSideLength*0.5),this.bb.halfSideLength*0.5))
		this.subtreeSW = new QTree(new BoundingBox(new PointOfIntrest(this.bb.center.x - this.bb.halfSideLength*0.5,this.bb.center.y + this.bb.halfSideLength*0.5),this.bb.halfSideLength*0.5))
		this.subtreeSE = new QTree(new BoundingBox(new PointOfIntrest(this.bb.center.x + this.bb.halfSideLength*0.5,this.bb.center.y + this.bb.halfSideLength*0.5),this.bb.halfSideLength*0.5))
		
		this.subtreeNW.depth = this.depth + 1
		this.subtreeNE.depth = this.depth + 1
		this.subtreeSW.depth = this.depth + 1
		this.subtreeSE.depth = this.depth + 1
		
		for (let pTemp of this.points){
			if (this.subtreeNW.insert(pTemp)){continue}
			if (this.subtreeNE.insert(pTemp)){continue}
			if (this.subtreeSW.insert(pTemp)){continue}
			if (this.subtreeSE.insert(pTemp)){continue}
		}
		
		this.points = []
		
	}
	
	insert(p){
		if (!this.bb.containsPoint(p)){
			//console.log(p.x + "," + p.y + " : not in tree")
			return false;
		}
		if ((this.points.length < this.maxPoints) && (this.subtreeNW == null)){
			//console.log("adding point: " + p.x + "," + p.y)
			this.points.push(p)
			return true;
		}
		if (this.subtreeNW == null){
			//console.log("subdividing")
			this.subdivide()
		}
		
		if (this.subtreeNW.insert(p)){return true}
		if (this.subtreeNE.insert(p)){return true}
		if (this.subtreeSW.insert(p)){return true}
		if (this.subtreeSE.insert(p)){return true}
		
		return false;
	}
}

function drawTree(tree){
	push()
	resetMatrix()
	strokeWeight(0.5)
	//noStroke()
	noFill()
	//fill(255,10)
	if ((tree.subtreeNW == null)){
		translate(tree.bb.center.x,tree.bb.center.y)
		rect(-tree.bb.halfSideLength,-tree.bb.halfSideLength,2*tree.bb.halfSideLength,2*tree.bb.halfSideLength)
	}
	
	if (!(tree.subtreeNW == null)){
		drawTree(tree.subtreeNW)
		drawTree(tree.subtreeNE)
		drawTree(tree.subtreeSW)
		drawTree(tree.subtreeSE)
	}
	pop()
}

function initParticleList(n){
	particleList = []
	for (let i = 0; i < n;i++){
		let x0 = 0.5*(windowWidth-windowHeight) +  Math.random()*windowHeight
		let y0 = Math.random()*windowHeight
		let vx = 0.3*(2*Math.random() - 1)
		let vy = 0.3*(2*Math.random() - 1)
		particleList.push(new Particle(new PointOfIntrest(x0,y0),new PointOfIntrest(vx,vy),5))
	}
}

function updateParticleList(pList){
	fill(255)
	noStroke()
	for (let pTemp of pList){
		pTemp.updateVelocity()
		pTemp.wallCollision(windowWidth*0.5-windowHeight*0.5,0,windowWidth*0.5+windowHeight*0.5,windowHeight)
		pTemp.updatePosition()
		//ellipse(pTemp.p.x,pTemp.p.y,2,2)
	}
}

function populateTree(pList,tree){
	for (let point of pList){
		tree.insert(point.p)
	}
}

function setup() {
	myCanvas = createCanvas(windowWidth, windowHeight);
	bc = color(BGD_COL[0],BGD_COL[1],BGD_COL[2],70)
	initParticleList(3000)
}

function draw() {
	
	background(bc)
	updateParticleList(particleList)
	
	myTree = new QTree(new BoundingBox(new PointOfIntrest(windowWidth*0.5, windowHeight*0.5),windowHeight*0.5))
	populateTree(particleList,myTree)
	
	stroke(255,100)
	drawTree(myTree)
	
	//noLoop();
}