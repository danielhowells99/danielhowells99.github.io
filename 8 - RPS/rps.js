import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"
import {getPostProcessingFilter,createScreenFramebuffer} from "../libraries/post-processing.js"
import {initializeUserInput} from "../libraries/user-input.js"


var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl");
/*
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}
*/

let scale = 1.0;
let screenScale = 1.0;
let screenBuffer1 = createScreenFramebuffer(gl,scale);
let screenBuffer2 = createScreenFramebuffer(gl,scale);
let userInput = initializeUserInput(canvas,false)

let reInitFlag = 0.0;

function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;

	//{textures,framebuffers} = prepare_textures_and_framebuffers(gl,canvas)
	screenBuffer1 = createScreenFramebuffer(gl,scale);
	screenBuffer2 = createScreenFramebuffer(gl,scale);
	userInput = initializeUserInput(canvas,false)
	
	reInitFlag = 1.0;
	
	gl.viewport(0,0,canvas.width,canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

//####################################################################
const affineFilter = getPostProcessingFilter(gl,"AFFINE")
const gaussian3Filter = getPostProcessingFilter(gl,"GAUSSIAN3")
const gaussian5Filter = getPostProcessingFilter(gl,"GAUSSIAN5")
const colourFilter = getPostProcessingFilter(gl,"COLOUR")
const transformFilter = getPostProcessingFilter(gl,"TRANSFORM")
const maximumFilter = getPostProcessingFilter(gl,"MAXIMUM")
const paintFilter = getPostProcessingFilter(gl,"PAINT8")
const ditherFilter = getPostProcessingFilter(gl,"DITHER")
//###################################################################

const dataProgram = initShaderProgram(gl, 'shaders/updateDataTextures.vert', 'shaders/updateDataTextures.frag');

const dataProgramInfo = {
	program: dataProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(dataProgram, "aVertexPosition"),
	},
	uniformLocations: {
		screenDimensions: gl.getUniformLocation(dataProgram, "uScreenDimensions"),
		dataSampler: gl.getUniformLocation(dataProgram, "uDataSampler"),
		deltaTime: gl.getUniformLocation(dataProgram, "uDeltaTime"),
		mousePos: gl.getUniformLocation(dataProgram, "uMousePos"),
		mouseForce: gl.getUniformLocation(dataProgram, "uMouseForce")
	},
};

let aspectRatio = canvas.width/canvas.height;

//set verticies for rectangle to render particles to
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, dataProgramInfo)

//set uniforms
gl.useProgram(dataProgram);
gl.uniform2fv(dataProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0); //Data located in TEXTURE0

var {textures,framebuffers} = prepare_textures_and_framebuffers(gl,canvas)

let f1 = framebuffers.framebuffer1
let f2 = framebuffers.framebuffer2

let pt1 = textures.dataTexture1
let pt2 = textures.dataTexture2

let startTime = new Date().getTime();
const frameLimit = 90; // PAL/NTSC TV?

const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
let timesList = [];

let anim = 0.0;

let obj = {}

function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	
	if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE
	
		if (reInitFlag == 1.0){
			obj = prepare_textures_and_framebuffers(gl,canvas)
			textures = obj.textures
			framebuffers = obj.framebuffers
			f1 = framebuffers.framebuffer1
			f2 = framebuffers.framebuffer2
			pt1 = textures.dataTexture1
			pt2 = textures.dataTexture2
			reInitFlag = 0.0
		}
		
		startTime = endTime
		aspectRatio = canvas.width/canvas.height
		
		gl.useProgram(dataProgram);
		gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,userInput.mouse_force);
		gl.uniform2fv(dataProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
		gl.uniform1f(dataProgramInfo.uniformLocations.deltaTime,delayMilliseconds);
		gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[(2.0*userInput.mouse_location.x-1.0),(2.0*userInput.mouse_location.y-1.0)]);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, pt1);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		
		gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
		setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, pt2);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		
		gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 1);
		setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		transformFilter.setTransform(gl,[0,0,0,1.0],[1.0,0.0,0.0,0.0])
		transformFilter.applyFilter(gl,screenBuffer1.texture,screenBuffer2.framebuffer)
		//paintFilter.applyFilter(gl,screenBuffer2.texture,screenBuffer1.framebuffer)
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