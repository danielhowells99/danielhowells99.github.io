import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"

//###---COMMON CODE---###

var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl",{preserveDrawingBuffer: true});
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

let scale = 1.0;
let screenScale = 1.5;
let screenBuffer = createScreenFramebuffer(gl,scale);

function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;

	screenBuffer = createScreenFramebuffer(gl,scale);
	
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let mouse = {x: 0,y: 0}
let mouseForce = 0.0;
let mouseToggle = 0.0;
let mouseStartTime = 0,mouseEndTime = 0;
let capFlag = 0;
let playFlag = 1.0;
setupUserInput()

//###################################################################

const parametricEqProgram = initShaderProgram(gl, 'shaders/parametricEq.vert', 'shaders/parametricEq.frag');
const parametricEqProgramInfo = {
	program: parametricEqProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(parametricEqProgram, "aVertexPosition"),
	},
	uniformLocations: {
		timeSampler: gl.getUniformLocation(parametricEqProgram, "uTimeSampler"),
		anim: gl.getUniformLocation(parametricEqProgram,"uAnim"),
	},
};

const particleProgram = initShaderProgram(gl, 'shaders/renderParticles.vert', 'shaders/renderParticles.frag');
const particleProgramInfo = {
	program: particleProgram,
	attribLocations: {
		indexData: gl.getAttribLocation(particleProgram, "aIndexData"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(particleProgram, "uDataSampler"),
		screenDimensions: gl.getUniformLocation(particleProgram, "uScreenDimensions"),
		anim: gl.getUniformLocation(particleProgram, "uAnim"),
		pointMode: gl.getUniformLocation(particleProgram, "uPointMode"),

	},
};

const screenSpaceProgram = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/screenSpaceShader.frag');
const screenSpaceProgramInfo = {
	program: screenSpaceProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(screenSpaceProgram, "aVertexPosition"),
	},
	uniformLocations: {
		framebufferTexture: gl.getUniformLocation(screenSpaceProgram, "uFbTexture"),
		screenDimensions: gl.getUniformLocation(screenSpaceProgram, "uScreenDimensions"),
		partColor: gl.getUniformLocation(screenSpaceProgram, "uPartColor"),
	},
};

const lineResSq = Math.round(Math.sqrt(6000)); //MAX 2890
const lineRes = lineResSq*lineResSq;
const time_data = []
const point_data = []
const index_data = []

for (let i = 0; i < lineRes; i++){
	let t = 2.0*i/(lineRes-1);
	time_data.push(t)

	let firstIndex = ((i%lineResSq)+0.5)/lineResSq;
	let secondIndex = (Math.floor(i/lineResSq)+0.5)/lineResSq;
	index_data.push(firstIndex)
	index_data.push(secondIndex)
	index_data.push(-t) //point label
	index_data.push(firstIndex)
	index_data.push(secondIndex)
	index_data.push(t) //home label
}

//Prepare time texture
const timeTexture = createTimeTexture(gl,lineResSq,time_data);

//set verticies for rectangle to render to
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//set texture-access coordinates for each particles
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(index_data), gl.STATIC_DRAW);

let startTime = new Date().getTime();
const frameLimit = 90; // PAL/NTSC TV?

const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
let timesList = [];

let particleData = createParticleData(gl,lineResSq);

//Bind timetex, draw triangles using parametric program to generate data tex
gl.useProgram(parametricEqProgram)
//gl.bindFramebuffer(gl.FRAMEBUFFER,screenBuffer.framebuffer)
gl.bindFramebuffer(gl.FRAMEBUFFER,particleData.framebuffer)
//gl.bindFramebuffer(gl.FRAMEBUFFER,null)
gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D, timeTexture)
gl.uniform1i(parametricEqProgramInfo.uniformLocations.timeSampler, 0);
setPositionAttribute(gl, positionBuffer, parametricEqProgramInfo); 
gl.viewport(0, 0, lineResSq, lineResSq);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

gl.useProgram(screenSpaceProgram);
gl.uniform3fv(screenSpaceProgramInfo.uniformLocations.partColor, [1.0,1.0,1.0]);

let anim = 0.0;
let recomputeFlag = 1.0;

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.clearColor(0.0,0.0,0.0,1.0);
gl.clear(gl.COLOR_BUFFER_BIT)

gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer.framebuffer);
gl.clearColor(0.0,0.0,0.0,1.0);
gl.clear(gl.COLOR_BUFFER_BIT)

function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	
	if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE

		startTime = endTime;

		
		((anim += 0.0007) > 1.0) ? anim = 0.0 : null;
		let s = anim;
		//recomputeFlag = 1.0;

		if (recomputeFlag == 1.0){
			gl.useProgram(parametricEqProgram)
			//gl.bindFramebuffer(gl.FRAMEBUFFER,screenBuffer.framebuffer)
			gl.bindFramebuffer(gl.FRAMEBUFFER,particleData.framebuffer)
			//gl.bindFramebuffer(gl.FRAMEBUFFER,null)
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, timeTexture)
			gl.uniform1i(parametricEqProgramInfo.uniformLocations.timeSampler, 0);
			gl.uniform1f(parametricEqProgramInfo.uniformLocations.anim, s);
			setPositionAttribute(gl, positionBuffer, parametricEqProgramInfo); 
			gl.viewport(0, 0, lineResSq, lineResSq);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			recomputeFlag = 0.0;
		}

		//render particles to screen framebuffer
		gl.useProgram(particleProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer.framebuffer);
		//gl.clearColor(16.0/255,13.0/255,48.0/255,1.0);
		//gl.clear(gl.COLOR_BUFFER_BIT)
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, particleData.texture);
		gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 1);
		gl.uniform2fv(particleProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
		gl.uniform1f(particleProgramInfo.uniformLocations.anim, s);

		gl.enable(gl.BLEND)
		gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE)
		//gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
		/*
		gl.uniform1i(particleProgramInfo.uniformLocations.pointMode, 1);
		setParticleIndexAttribute(gl, indexBuffer, particleProgramInfo,3)
		gl.drawArrays(gl.POINTS, 0, 2*lineResSq*lineResSq);  
		*/
		
		gl.uniform1i(particleProgramInfo.uniformLocations.pointMode, 0);
		setParticleIndexAttribute(gl, indexBuffer, particleProgramInfo,3)
		gl.drawArrays(gl.LINES, 0, 2.0*lineResSq*lineResSq);  
		
		gl.disable(gl.BLEND)
		
		/*
		gl.useProgram(screenSpaceProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer.texture);
		gl.uniform1i(screenSpaceProgramInfo.uniformLocations.framebufferTexture, 2);
		gl.uniform2fv(screenSpaceProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
		setPositionAttribute(gl, positionBuffer, screenSpaceProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		*/
		
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

function setParticleIndexAttribute(gl,buffer,programInfo,stride) { //sets the index attribute (vec2) for each particle
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		3,
		gl.FLOAT,
		false,
		stride*4,
		0,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function createScreenFramebuffer(gl,size){
	let screenTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size*canvas.width, size*canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(size*size*canvas.width*canvas.height*4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, screenTexture, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

	return {
		texture: screenTexture,
		framebuffer: framebuffer,
	}
}

function createTimeTexture(gl,timeDimSq,timeData){
	let timeTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, timeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, timeDimSq, timeDimSq, 0, gl.LUMINANCE,
		gl.FLOAT, new Float32Array(timeData));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return timeTexture;
}

function createParticleData(gl,timeDimSq){
	let particleDataTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, particleDataTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, timeDimSq, timeDimSq, 0, gl.RGBA,
		gl.FLOAT, new Float32Array(timeDimSq*timeDimSq*4));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var particleDataFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, particleDataFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, particleDataTexture, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

	return {
		texture: particleDataTexture,
		framebuffer: particleDataFramebuffer,
	}
}

function setupUserInput(){
	
	function isTouchDevice() {
		return (('ontouchstart' in window) ||
			(navigator.maxTouchPoints > 0) ||
			(navigator.msMaxTouchPoints > 0));
	}

	if (isTouchDevice()){
		ontouchmove = function(e){mouse = {x: screenScale*e.touches[0].clientX/canvas.width, y: 1-screenScale*e.touches[0].clientY/canvas.height};mouseForce = 1.0;}
		ontouchstart = function(e){mouse = {x: screenScale*e.changedTouches[0].clientX/canvas.width, y: 1-screenScale*e.changedTouches[0].clientY/canvas.height};mouseForce = 1.0;}
		ontouchend = function(e){mouse = {x: screenScale*e.changedTouches[0].clientX/canvas.width, y: 1-screenScale*e.changedTouches[0].clientY/canvas.height};mouseForce = 0.0;}
	}

	onmousemove = function(e){
		mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
	}
	onmousedown = function(e){
		mouseStartTime = new Date().getTime()
		mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
		mouseForce = 1.0;
	}
	onmouseup = function(e){
		mouseEndTime = new Date().getTime()
		mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
		mouseForce = 0.0;
	}

	document.addEventListener("keypress", function onEvent(event) {
		if (event.key == "p" || event.key == "P"){
			capFlag = 1;
		}
		if (event.key == "a" || event.key == "A"){
			playFlag = 0.0;
		}
		if (event.key == "d" || event.key == "D"){
			playFlag = 1;
		}
	});

}
