import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"


var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl");
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

gl.clearColor(0.0, 0.0, 0.03, 1.0);//GALAXY BLUE
//gl.clearColor(0.98, 0.92, 0.85, 1.0);//parchment
//gl.clearColor(0.005,0.015,0.045,1.0);

gl.clearDepth(10.0);

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);
}


window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let mouse = {x: 0,y: 0}
let mouseForce = 0.0;
let mouseToggle = 1.0

function isTouchDevice() {
return (('ontouchstart' in window) ||
	(navigator.maxTouchPoints > 0) ||
	(navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()){
	ontouchmove = function(e){mouse = {x: e.touches[0].clientX/canvas.width, y: 1-e.touches[0].clientY/canvas.height};mouseForce = 1.0;}
	ontouchstart = function(e){mouse = {x: e.changedTouches[0].clientX/canvas.width, y: 1-e.changedTouches[0].clientY/canvas.height};mouseForce = 1.0;}
	ontouchend = function(e){mouse = {x: e.changedTouches[0].clientX/canvas.width, y: 1-e.changedTouches[0].clientY/canvas.height};mouseForce = 0.0;}
}

let mouseStartTime = 0,mouseEndTime = 0

onmousemove = function(e){
	mouse = {x: e.clientX/canvas.width, y: 1-e.clientY/canvas.height}; 
	mouseForce = mouseToggle;
	}
onmousedown = function(e){
	
	mouseStartTime = new Date().getTime()
	
	mouse = {x: e.clientX/canvas.width, y: 1-e.clientY/canvas.height}; 
	mouseToggle = mouseToggle^1; 
	mouseForce = 1.0*mouseToggle;
	}
onmouseup = function(e){
	
	mouseEndTime = new Date().getTime()
	if (mouseEndTime-mouseStartTime > 250){
		mouseToggle = mouseToggle^1; 
	}
	
	mouse = {x: e.clientX/canvas.width, y: 1-e.clientY/canvas.height}; 
	mouseForce = 1.0*mouseToggle;
	}


let capFlag = 0;
document.addEventListener("keypress", function onEvent(event) {
	if (event.key == "p" || event.key == "P"){
		capFlag = 1;
	}
});

const dataProgram = initShaderProgram(gl, 'shaders/updateDataTextures.vert', 'shaders/updateDataTextures.frag');
const particleProgram = initShaderProgram(gl, 'shaders/renderParticles.vert', 'shaders/renderParticles.frag');

const dataProgramInfo = {
	program: dataProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(dataProgram, "aVertexPosition"),
	},
	uniformLocations: {
		aspect: gl.getUniformLocation(dataProgram, "uAspect"),
		dataSampler: gl.getUniformLocation(dataProgram, "uDataSampler"),
		homeSampler: gl.getUniformLocation(dataProgram, "uHomeSampler"),
		deltaTime: gl.getUniformLocation(dataProgram, "uDeltaTime"),
		mousePos: gl.getUniformLocation(dataProgram, "uMousePos"),
		mouseForce: gl.getUniformLocation(dataProgram, "uMouseForce")
	},
};

const particleProgramInfo = {
	program: particleProgram,
	attribLocations: {
		indexData: gl.getAttribLocation(particleProgram, "aIndexData"),
	},
	uniformLocations: {
		aspect: gl.getUniformLocation(particleProgram, "uAspect"),
		particleNumSq: gl.getUniformLocation(particleProgram, "uParticleNumSq"),
		canvasDimension: gl.getUniformLocation(particleProgram, "uCanvasDimension"),
		sizeSampler: gl.getUniformLocation(particleProgram, "uSizeSampler"),
		dataSampler: gl.getUniformLocation(particleProgram, "uDataSampler"),
	},
};

let aspectRatio = canvas.width/canvas.height;

const particle_num = 800*800//524288;
const particle_num_sqd = Math.ceil(Math.sqrt(particle_num));

const particle_data = []
const size_data = []
const index_data = []

for (let i = 0; i < particle_num_sqd*particle_num_sqd; i++){
	/*
	let point_angle = Math.random()*Math.PI*2
	let point_dist = 0.6*Math.sqrt(Math.random())
	particle_data.push(Math.cos(point_angle)*point_dist/aspectRatio)
	particle_data.push(Math.sin(point_angle)*point_dist)
	*/
	particle_data.push(0.4*(-1+Math.random()*2)/aspectRatio)
	particle_data.push(0.4*(-1+Math.random()*2)/aspectRatio)
	//particle_data.push(0)
	//particle_data.push(0)
	particle_data.push((-1+Math.random()*2))
	particle_data.push((-1+Math.random()*2))
	//particle_data.push(0)
	//particle_data.push(0)
	/*
	let sizeval = Math.random();
	sizeval = sizeval < 0.9 ? 0.0 : (sizeval < 0.99 ? 100.0 : (sizeval < 0.999 ? 150.0 : 200.0));
	size_data.push(sizeval);
	size_data.push(sizeval);
	size_data.push(sizeval);
	size_data.push(sizeval);
	*/
	index_data.push((i%particle_num_sqd)/particle_num_sqd)
	index_data.push(Math.floor(i/particle_num_sqd)/particle_num_sqd)
}

//set verticies for rectangle to render particles to
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, dataProgramInfo)


const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(index_data), gl.STATIC_DRAW);
setParticleIndexAttribute(gl, indexBuffer, particleProgramInfo)


var {textures,framebuffers} = prepare_textures_and_framebuffers(gl,particle_num_sqd,particle_data,size_data)

/*
gl.activeTexture(gl.TEXTURE2);
gl.bindTexture(gl.TEXTURE_2D, textures.sizeTex);
*/

gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, textures.initTex);

//set uniforms

gl.useProgram(dataProgram);
gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
gl.uniform1i(dataProgramInfo.uniformLocations.homeSampler, 1);

gl.useProgram(particleProgram);
gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform2fv(particleProgramInfo.uniformLocations.canvasDimension,[canvas.width,canvas.height]);
gl.uniform1f(particleProgramInfo.uniformLocations.particleNumSq,particle_num_sqd);
gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);

/*
let pixels = new Float32Array(4 * particle_num_sqd*particle_num_sqd);
let particleDataBuffer = gl.createBuffer();

gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.framebuffer1);
//gl.readBuffers(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, particle_num_sqd, particle_num_sqd, gl.RGBA, gl.FLOAT, pixels);
console.log("framebuffer1: ",pixels[0],pixels[1],pixels[2],pixels[3])

gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.framebuffer2);
//gl.readBuffers(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, particle_num_sqd, particle_num_sqd, gl.RGBA, gl.FLOAT, pixels);
console.log("framebuffer2: ",pixels[0],pixels[1],pixels[2],pixels[3])
*/

let f1 = framebuffers.framebuffer1
let f2 = framebuffers.framebuffer2

let pt1 = textures.dataTexture1
let pt2 = textures.dataTexture2

let frameCounter = 0;

let startTime = new Date().getTime();
let frameAverage = [];

//const fpsElem = document.querySelector("#fps");

function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	//console.log(delayMilliseconds)
	/*
	frameAverage.push(delayMilliseconds)
	if (frameAverage.length > 500){
		frameAverage.shift()
	}
	let averageRate = frameAverage.reduce((accumulator, currentValue) => accumulator + currentValue)/frameAverage.length
	fpsElem.textContent = "MIN: " + Math.min(...frameAverage).toFixed(4) + " | MAX: " + Math.max(...frameAverage).toFixed(4) + " | AVG: " + (1.0/averageRate).toFixed(0);
	*/
	
	if (delayMilliseconds > 1/60){
			
		startTime = endTime
		
		aspectRatio = canvas.width/canvas.height
		frameCounter += 1;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		
		//console.log(delayMilliseconds)
		
		gl.useProgram(dataProgram);
		gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
		gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
		//gl.uniform1f(dataProgramInfo.uniformLocations.frameCount,frameCounter);
		gl.uniform1f(dataProgramInfo.uniformLocations.deltaTime,delayMilliseconds);
		gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[aspectRatio*(2.0*mouse.x-1.0),(2.0*mouse.y-1.0)]);
		//gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[aspectRatio*0.4*aspectRatio*Math.sin(3*frameCounter/540),0.4*Math.cos(5*frameCounter/540)]);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, pt1);
		
		//gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
		gl.viewport(0, 0, particle_num_sqd, particle_num_sqd);
		
		setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		/*
		//gl.readBuffer(gl.COLOR_ATTACHMENT0);
		gl.readPixels(0, 0, particle_num_sqd, particle_num_sqd, gl.RGBA, gl.FLOAT, pixels);
		*/
		
		/*
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pixels), gl.STATIC_DRAW);
		setParticleDataAttribute(gl,particleDataBuffer,particleProgramInfo)
		*/

		gl.useProgram(particleProgram);
		gl.uniform2fv(particleProgramInfo.uniformLocations.canvasDimension,[canvas.width,canvas.height]);
		gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.enable(gl.BLEND);
		//gl.enable(gl.DEPTH_TEST);
		//gl.depthFunc(gl.NOTEQUAL)
		
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ZERO);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.DST_COLOR, gl.ZERO);
		
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE); //CLEAR/BLACK BACKGROUND
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE); //WHITE BACKGROUND
		
		//gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
		setParticleIndexAttribute(gl,indexBuffer,particleProgramInfo)
		//gl.enableVertexAttribArray(particleProgramInfo.attribLocations.indexData);
		gl.drawArrays(gl.POINTS, 0, particle_num_sqd*particle_num_sqd);  
		
		gl.disable(gl.BLEND);
		//gl.disable(gl.DEPTH_TEST)
		
		// swap which texture we are rendering from and to
		var t = pt1;
		pt1 = pt2;
		pt2 = t;
		
		var f = f1;
		f1 = f2;
		f2 = f;

		if (capFlag == 1){
			console.log("saving picture")
			var dataURL = gl.canvas.toDataURL("image/png");
			var a = document.createElement('a');
			a.href = dataURL;
			a.download = "picture.png";
			document.body.appendChild(a);
			a.click();
			capFlag = 0;
		}
	}
	requestAnimationFrame(render);
}
requestAnimationFrame(render);


function setPositionAttribute(gl, buffer, programInfo) {
	const numComponents = 2; // pull out 2 values per iteration
	const type = gl.FLOAT; // the data in the buffer is 32bit floats
	const normalize = false; // normalize
	const stride = 0; // how many bytes to get from one set of values to the next
	// 0 = use type and numComponents above
	const offset = 0; // how many bytes inside the buffer to start from
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setParticleDataAttribute(gl,buffer,programInfo){
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexData,
		4,
		gl.FLOAT,
		false,
		0,
		0,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexData);
}

function setParticleIndexAttribute(gl,buffer,programInfo){
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.indexData,
		2,
		gl.FLOAT,
		false,
		0,
		0,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.indexData);
}
