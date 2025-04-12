import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"
import {getPostProcessingFilter,createScreenFramebuffer} from "../libraries/post-processing.js"
import {initializeUserInput} from "../libraries/user-input.js"


var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl", {stencil: true});
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

//let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
//let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

let scale = 1.0;
let screenScale = 1.0;
let screenBuffer1 = createScreenFramebuffer(gl,scale);
let screenBuffer2 = createScreenFramebuffer(gl,scale);
let minCanvDim = canvas.height;

let userInput = initializeUserInput(canvas,false)

function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;

	screenBuffer1 = createScreenFramebuffer(gl,scale);
	screenBuffer2 = createScreenFramebuffer(gl,scale);
	minCanvDim = Math.min(canvas.height,canvas.width)

	userInput = initializeUserInput(canvas,false)
	
	gl.viewport(0,0,canvas.width,canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


const affineFilter = getPostProcessingFilter(gl,"AFFINE")
const gaussian3Filter = getPostProcessingFilter(gl,"GAUSSIAN3")
const gaussian5Filter = getPostProcessingFilter(gl,"GAUSSIAN5")
const colourFilter = getPostProcessingFilter(gl,"COLOUR")
const TransformFilter = getPostProcessingFilter(gl,"TRANSFORM")
const maximumFilter = getPostProcessingFilter(gl,"MAXIMUM")
const paintFilter = getPostProcessingFilter(gl,"PAINT8")
const ditherFilter = getPostProcessingFilter(gl,"DITHER")
//####################################################################

//###################################################################

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
		deltaTime: gl.getUniformLocation(dataProgram, "uDeltaTime"),
		mousePos: gl.getUniformLocation(dataProgram, "uMousePos"),
		mouseForce: gl.getUniformLocation(dataProgram, "uMouseForce"),
		particleNumSq: gl.getUniformLocation(dataProgram, "uParticleNumSq"),
	},
};

const particleProgramInfo = {
	program: particleProgram,
	attribLocations: {
		indexData: gl.getAttribLocation(particleProgram, "aIndexData"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(particleProgram, "uDataSampler"),
		minCanvDim: gl.getUniformLocation(particleProgram, "uMinCanvDim"),
	},
};

let aspectRatio = canvas.width/canvas.height;

const particle_num = 64*64;
const particle_num_sqd = Math.ceil(Math.sqrt(particle_num));
const particle_data = []
const index_data = []

for (let i = 0; i < particle_num_sqd*particle_num_sqd; i++){
	let angle = 2*Math.PI*Math.random()
	let rad = Math.random()
	particle_data.push(0.9*rad*rad*Math.cos(angle)/aspectRatio)//aspect?
	particle_data.push((0.9*rad*rad*Math.sin(angle)))
	particle_data.push(0)
	particle_data.push(0)
	index_data.push(((i%particle_num_sqd)+0.5)/particle_num_sqd)
	index_data.push((Math.floor(i/particle_num_sqd)+0.5)/particle_num_sqd)
}

//set verticies for rectangle to render particles to
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, dataProgramInfo)

//set texture-access coordinates for each particles
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(index_data), gl.STATIC_DRAW);
setParticleIndexAttribute(gl, indexBuffer, particleProgramInfo)

var {textures,framebuffers} = prepare_textures_and_framebuffers(gl,particle_num_sqd,particle_data)

//set uniforms
gl.useProgram(dataProgram);
gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,userInput.mouse_force);
gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1f(dataProgramInfo.uniformLocations.particleNumSq,particle_num_sqd);
gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0); //Data located in TEXTURE0

gl.useProgram(particleProgram);
gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
gl.uniform1f(particleProgramInfo.uniformLocations.minCanvDim,minCanvDim);

let f1 = framebuffers.framebuffer1
let f2 = framebuffers.framebuffer2

let pt1 = textures.dataTexture1
let pt2 = textures.dataTexture2

let startTime = new Date().getTime();
const frameLimit = 120; // PAL/NTSC TV?

const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
let timesList = [];

function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	
	if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE
	
		timesList.push(delayMilliseconds)
		if (timesList.length > 30){
			timesList.shift();
		}
		
		let timeAvg = Math.min(average(timesList),1.0/30.0);
		startTime = endTime
		aspectRatio = canvas.width/canvas.height
		
		gl.useProgram(dataProgram);
		gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,userInput.mouse_force);
		gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
		gl.uniform1f(dataProgramInfo.uniformLocations.deltaTime,timeAvg);
		gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[(2.0*userInput.mouse_location.x-1.0),(2.0*userInput.mouse_location.y-1.0)]);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, pt1);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
		gl.viewport(0, 0, particle_num_sqd, particle_num_sqd);
		
		gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
		setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.useProgram(particleProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);

		gl.clearColor(0.0,0.0,0.0,0.0);
		gl.clear(gl.COLOR_BUFFER_BIT)

		gl.viewport(0, 0, scale*gl.canvas.width, scale*gl.canvas.height);
		
		gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
		gl.uniform1f(particleProgramInfo.uniformLocations.minCanvDim,minCanvDim);
		setParticleIndexAttribute(gl,indexBuffer,particleProgramInfo)

		gl.enable(gl.BLEND)
		gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE)
		gl.drawArrays(gl.POINTS, 0, particle_num_sqd*particle_num_sqd);  
		gl.disable(gl.BLEND)

		paintFilter.applyFilter(gl,screenBuffer1.texture,screenBuffer2.framebuffer)
		colourFilter.applyFilter(gl,screenBuffer2.texture,null)

		// swap which texture we are rendering from and to
		var t = pt1;
		pt1 = pt2;
		pt2 = t;
		
		var f = f1;
		f1 = f2;
		f2 = f;

		if (userInput.cap_flag == 1){
			console.log("saving picture")
			var dataURL = gl.canvas.toDataURL("image/png");
			var a = document.createElement('a');
			a.href = dataURL;
			a.download = "picture.png";
			document.body.appendChild(a);
			a.click();
			userInput.cap_flag = 0;
		}
	}
	requestAnimationFrame(render);
}
requestAnimationFrame(render);


function setPositionAttribute(gl, buffer, programInfo) { //Sets verticies for rectangle to store to framebuffers
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

function setParticleIndexAttribute(gl,buffer,programInfo) { //sets the index attribute (vec2) for each particle
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

