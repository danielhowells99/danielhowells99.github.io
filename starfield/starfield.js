import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"

var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl2");
if (!gl) { alert( "WebGL 2.0 isn't available" ); }
gl.clearColor(0.01, 0.01, 0.1, 0.0);
gl.clearDepth(1.0);

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let mouse = {x: 0,y: 0}
let mouseForce = 0.0;

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
onmousemove = function(e){mouse = {x: e.clientX/canvas.width, y: 1-e.clientY/canvas.height};mouseForce = 1.0;}

const dataProgram = initShaderProgram(gl, 'shaders/updateDataTextures.vert', 'shaders/updateDataTextures.frag');
const particleProgram = initShaderProgram(gl, 'shaders/renderParticles.vert', 'shaders/renderParticles.frag');

const dataProgramInfo = {
	program: dataProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(dataProgram, "aVertexPosition"),
	},
	uniformLocations: {
		aspect: gl.getUniformLocation(dataProgram, "uAspect"),
		positionSampler: gl.getUniformLocation(dataProgram, "uPositionSampler"),
		velocitySampler: gl.getUniformLocation(dataProgram, "uVelocitySampler"),
		homeSampler: gl.getUniformLocation(dataProgram, "uHomeSampler"),
		particleNumSqd: gl.getUniformLocation(dataProgram, "uParticleNumSqd"),
		frameCount: gl.getUniformLocation(dataProgram, "uFrameCount"),
		mousePos: gl.getUniformLocation(dataProgram, "uMousePos"),
		mouseForce: gl.getUniformLocation(dataProgram, "uMouseForce")
	},
};

const particleProgramInfo = {
	program: particleProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(particleProgram, "aVertexPosition"),
		vertexVelocity: gl.getAttribLocation(particleProgram, "aVertexVelocity"),
	},
	uniformLocations: {
		aspect: gl.getUniformLocation(particleProgram, "uAspect"),
		particleNumSqd: gl.getUniformLocation(particleProgram, "uParticleNumSqd")
	},
};

const particleNumSqd = 100.0
const particleNum = particleNumSqd*particleNumSqd

const particle_positions = []
const particle_velocities = []

const velocityConst = [127.5,127.5,127.5,127.5]
for (let i = 0; i < particleNum; i++){
	particle_velocities.push(Math.round(velocityConst[0] + (2.0*Math.random()-1.0)*10.0)) //x
	particle_velocities.push(Math.round(velocityConst[1] + (2.0*Math.random()-1.0)*127.5)) //y
	particle_velocities.push(Math.round(velocityConst[2] + (2.0*Math.random()-1.0)*10.0)) //vx
	particle_velocities.push(Math.round(velocityConst[3] + (2.0*Math.random()-1.0)*127.5)) //vy

	particle_positions.push(127 + (2.0*Math.random()-1.0)*100.0) //x
	particle_positions.push(Math.round(Math.random()*255))
	particle_positions.push(127 + (2.0*Math.random()-1.0)*100.0)
	particle_positions.push(Math.round(Math.random()*255))
}

//
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
//

var {textures,framebuffers} = prepare_textures_and_framebuffers(gl,
	particleNumSqd,particle_positions,particle_velocities)

const homePositionTex = gl.createTexture();
gl.activeTexture(gl.TEXTURE2);
gl.bindTexture(gl.TEXTURE_2D, homePositionTex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particleNumSqd, particleNumSqd, 0, gl.RGBA,
			gl.UNSIGNED_BYTE, new Uint8Array(particle_positions));
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//set uniforms
let aspectRatio = canvas.width/canvas.height;

gl.useProgram(dataProgram);
gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1f(dataProgramInfo.uniformLocations.particleNumSqd,particleNumSqd);
gl.uniform1i(dataProgramInfo.uniformLocations.positionSampler, 0);
gl.uniform1i(dataProgramInfo.uniformLocations.velocitySampler, 1);
gl.uniform1i(dataProgramInfo.uniformLocations.homeSampler, 2);

gl.useProgram(particleProgram);
gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1f(particleProgramInfo.uniformLocations.particleNumSqd,particleNumSqd);

let pixels = new Uint8Array(4 * particleNumSqd * particleNumSqd);
let particlePosBuffer = gl.createBuffer();
let particleVelBuffer = gl.createBuffer();

//console.log("buffer1: initTex")
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.fb1);
gl.readBuffer(gl.COLOR_ATTACHMENT1);
gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
//console.log("v: ",pixels[0],pixels[1],pixels[2],pixels[3])

gl.readBuffer(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
//console.log("p: ",pixels[0],pixels[1],pixels[2],pixels[3])

//console.log("buffer2: initTex")
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers.fb2);
gl.readBuffer(gl.COLOR_ATTACHMENT1);
gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
//console.log("v: ",pixels[0],pixels[1],pixels[2],pixels[3])

gl.readBuffer(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
//console.log("p: ",pixels[0],pixels[1],pixels[2],pixels[3])


let f1 = framebuffers.fb1
let f2 = framebuffers.fb2

let pt1 = textures.positionTex1
let pt2 = textures.positionTex2

let vt1 = textures.velocityTex1
let vt2 = textures.velocityTex2

let bufferlabel1 = "------framebuffer1------"
let bufferlabel2 = "------framebuffer2------"

let frameCounter = 0;

function printBuffers(f,bufferlabel){
	console.log(bufferlabel)
	gl.bindFramebuffer(gl.FRAMEBUFFER, f);
	gl.readBuffer(gl.COLOR_ATTACHMENT1);
	gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	console.log("velocities: ",pixels[0],pixels[1],pixels[2],pixels[3])

	gl.readBuffer(gl.COLOR_ATTACHMENT0);
	gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	console.log("positions: ",pixels[0],pixels[1],pixels[2],pixels[3])
}


function render() {
	aspectRatio = canvas.width/canvas.height
	//console.log(mouse.x,mouse.y)
	frameCounter += 1;
	//console.log("frame: " + frameCounter)
	//gl.clear(gl.COLOR_BUFFER_BIT)

	gl.useProgram(dataProgram);
	gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
	gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
	gl.uniform1f(dataProgramInfo.uniformLocations.frameCount,frameCounter);
	gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[aspectRatio*(2.0*mouse.x-1.0),(2.0*mouse.y-1.0)]);
	//gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[aspectRatio*0.4*aspectRatio*Math.sin(3*frameCounter/540),0.4*Math.cos(5*frameCounter/540)]);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pt1);  
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, vt1);  
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, homePositionTex);
	
	gl.uniform1i(dataProgramInfo.uniformLocations.positionSampler, 0);
	gl.uniform1i(dataProgramInfo.uniformLocations.velocitySampler, 1);
	gl.uniform1i(dataProgramInfo.uniformLocations.homeSampler, 2);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
	gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1])

	gl.viewport(0, 0, particleNumSqd, particleNumSqd);
	
	setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	gl.readBuffer(gl.COLOR_ATTACHMENT0);
	gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	gl.bindBuffer(gl.ARRAY_BUFFER, particlePosBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(pixels), gl.STATIC_DRAW);
	setParticlePosAttribute(gl,particlePosBuffer,particleProgramInfo)

	gl.readBuffer(gl.COLOR_ATTACHMENT1);
	gl.readPixels(0, 0, particleNumSqd, particleNumSqd, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	gl.bindBuffer(gl.ARRAY_BUFFER, particleVelBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(pixels), gl.STATIC_DRAW);
	setParticleVelAttribute(gl,particleVelBuffer,particleProgramInfo)

	gl.useProgram(particleProgram);
	gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.drawArrays(gl.POINTS, 0, particleNum);
	
	// swap which texture we are rendering from and to
	var t = pt1;
	pt1 = pt2;
	pt2 = t;
	
	t = vt1;
	vt1 = vt2;
	vt2 = t;
	
	var f = f1;
	f1 = f2;
	f2 = f;

	var bl = bufferlabel2
	bufferlabel2 = bufferlabel1
	bufferlabel1 = bl

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
		programInfo.attribLocations.position,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.position);
}

function setParticlePosAttribute(gl,buffer,programInfo){
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		4,
		gl.UNSIGNED_BYTE,
		false,
		0,
		0,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexVelocity);
}

function setParticleVelAttribute(gl,buffer,programInfo){
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexVelocity,
		4,
		gl.UNSIGNED_BYTE,
		false,
		0,
		0,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexVelocity);
}