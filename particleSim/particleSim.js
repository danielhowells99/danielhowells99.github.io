import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"


var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl", {stencil: true});
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

//gl.clearColor(0.0, 0.0, 0.03, 1.0);//GALAXY BLUE
//gl.clearColor(0.05, 0.01, 0.02, 1.0);
//gl.clearColor(0.98, 0.92, 0.85, 1.0);//parchment
//gl.clearColor(0.98, 0.92, 0.85, 0.0);//parchment
gl.clearDepth(1.0);

let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
//let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

let parts = [0.0,0.0,0.0,255*0.03]
//let parts = [0.0,255*0.98, 255*0.92, 255*0.85]


let partCol = [1-parts[1]/255,1-parts[2]/255,1-parts[3]/255]


gl.clearColor(parts[1]/255, parts[2]/255, parts[3]/255, 1.0);

let scale = 2.0;
let screenScale = 1.5;
let screenBuffer = createScreenFramebuffer(gl,scale);
//let screenBuffer2 = createScreenFramebuffer(gl,scale);


function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;
	//gl.clear(gl.COLOR_BUFFER_BIT)

	screenBuffer = createScreenFramebuffer(gl,scale);
	//screenBuffer2 = createScreenFramebuffer(gl,scale);
	
	gl.viewport(0,0,canvas.width,canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

//####################################################################

let mouse = {x: 0,y: 0}
let mouseForce = 0.0;
let mouseToggle = 0.0

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

let mouseStartTime = 0,mouseEndTime = 0

onmousemove = function(e){
	mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
	mouseForce = mouseToggle;
	}
onmousedown = function(e){
	
	mouseStartTime = new Date().getTime()
	
	mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
	mouseToggle = mouseToggle^1; 
	mouseForce = 1.0*mouseToggle;
	}
onmouseup = function(e){
	
	mouseEndTime = new Date().getTime()
	if (mouseEndTime-mouseStartTime > 250){
		mouseToggle = mouseToggle^1; 
	}
	
	mouse = {x: screenScale*e.clientX/canvas.width, y: 1-screenScale*e.clientY/canvas.height}; 
	mouseForce = 1.0*mouseToggle;
	}


let capFlag = 0;
document.addEventListener("keypress", function onEvent(event) {
	if (event.key == "p" || event.key == "P"){
		capFlag = 1;
	}
});

//###################################################################

const dataProgram = initShaderProgram(gl, 'shaders/updateDataTextures.vert', 'shaders/updateDataTextures.frag');
const particleProgram = initShaderProgram(gl, 'shaders/renderParticles.vert', 'shaders/renderParticles.frag');
const screenBufferProgram = initShaderProgram(gl, 'shaders/bufferToScreen.vert', 'shaders/bufferToScreen.frag');

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
		dataSampler: gl.getUniformLocation(particleProgram, "uDataSampler"),
		partColor: gl.getUniformLocation(particleProgram, "uPartColor"),
	},
};

const screenBufferProgramInfo = {
	program: screenBufferProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(screenBufferProgram, "aVertexPosition"),
	},
	uniformLocations: {
		framebufferTexture: gl.getUniformLocation(screenBufferProgram, "uFbTexture"),
		screenDimensions: gl.getUniformLocation(screenBufferProgram, "uScreenDimensions"),
		transparencyTest: gl.getUniformLocation(screenBufferProgram, "uTransparencyTest"),
		partColor: gl.getUniformLocation(screenBufferProgram, "uPartColor"),
	},
};

let aspectRatio = canvas.width/canvas.height;

const particle_num = 1200*1200;
const particle_num_sqd = Math.ceil(Math.sqrt(particle_num));
const particle_data = []
const index_data = []

for (let i = 0; i < particle_num_sqd*particle_num_sqd; i++){
	particle_data.push(0.4*(-1+Math.random()*2))
	particle_data.push(0.4*(-1+Math.random()*2))
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
gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0); //Data located in TEXTURE0

gl.useProgram(particleProgram);
gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
gl.uniform3fv(particleProgramInfo.uniformLocations.partColor, partCol);

gl.useProgram(screenBufferProgram);
gl.uniform3fv(screenBufferProgramInfo.uniformLocations.partColor, partCol);

let f1 = framebuffers.framebuffer1
let f2 = framebuffers.framebuffer2

let pt1 = textures.dataTexture1
let pt2 = textures.dataTexture2

let startTime = new Date().getTime();
const frameLimit = 60; // PAL/NTSC TV?
/*
//--------------------
gl.stencilFunc(
	gl.GREATER,     // the test
	500,            // reference value
	0xFF,         // mask
	);
	// don't change the stencil buffer on draw
gl.stencilOp(
	gl.KEEP,     // what to do if the stencil test fails
	gl.KEEP,     // what to do if the depth test fails
	gl.INCR,  // what to do if both tests pass
	);
//---------------------
*/
function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	
	if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE
			
		startTime = endTime
		
		aspectRatio = canvas.width/canvas.height
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		//gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
		gl.useProgram(dataProgram);
		gl.uniform1f(dataProgramInfo.uniformLocations.mouseForce,mouseForce);
		gl.uniform1f(dataProgramInfo.uniformLocations.aspect,aspectRatio);
		gl.uniform1f(dataProgramInfo.uniformLocations.deltaTime,delayMilliseconds);
		gl.uniform2fv(dataProgramInfo.uniformLocations.mousePos,[(2.0*mouse.x-1.0),(2.0*mouse.y-1.0)]);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, pt1);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
		gl.viewport(0, 0, particle_num_sqd, particle_num_sqd);
		
		gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
		setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.useProgram(particleProgram);
		//gl.uniform2fv(particleProgramInfo.uniformLocations.canvasDimension,[canvas.width,canvas.height]);
		//gl.uniform1f(particleProgramInfo.uniformLocations.aspect,aspectRatio);
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer.framebuffer);

		gl.clearColor(parts[1]/255, parts[2]/255, parts[3]/255, 0.0);

		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.viewport(0, 0, scale*gl.canvas.width, scale*gl.canvas.height);
		
		//gl.enable(gl.BLEND);
		//gl.enable(gl.DEPTH_TEST);
		//gl.enable(gl.STENCIL_TEST);
		//gl.depthFunc(gl.NOTEQUAL)

		//gl.blendColor(0.7, 0.2, 0.1, 1);
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE); //CLEAR/BLACK BACKGROUND
		//gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE); //WHITE BACKGROUND
		gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
		setParticleIndexAttribute(gl,indexBuffer,particleProgramInfo)
		gl.drawArrays(gl.POINTS, 0, particle_num_sqd*particle_num_sqd);  
		
		//gl.disable(gl.BLEND);
		//gl.disable(gl.DEPTH_TEST)
		//gl.disable(gl.STENCIL_TEST);
		
		//gl.enable(gl.BLEND);
		/*
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO); //CLEAR/BLACK BACKGROUND
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); //CLEAR/BLACK BACKGROUND
		
		gl.useProgram(screenBufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer.framebuffer);
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer2.texture);
		gl.uniform1i(screenBufferProgramInfo.uniformLocations.framebufferTexture, 2);
		gl.uniform1f(screenBufferProgramInfo.uniformLocations.transparencyTest, 1.0);
		gl.uniform2fv(screenBufferProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
		setPositionAttribute(gl, positionBuffer, screenBufferProgramInfo) 
		
		gl.clearColor(parts[1]/255, parts[2]/255, parts[3]/255, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		*/
		//gl.enable(gl.BLEND);
		gl.useProgram(screenBufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer.texture);
		gl.uniform1i(screenBufferProgramInfo.uniformLocations.framebufferTexture, 3);
		gl.uniform1f(screenBufferProgramInfo.uniformLocations.transparencyTest, 1.0);
		gl.uniform2fv(screenBufferProgramInfo.uniformLocations.screenDimensions, [scale*canvas.width, scale*canvas.height]);
		setPositionAttribute(gl, positionBuffer, screenBufferProgramInfo) 
		
		gl.clearColor(parts[1]/255, parts[2]/255, parts[3]/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE); //CLEAR/BLACK BACKGROUND
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE); //white
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.BLEND);
		
		
		// swap which texture we are rendering from and to
		var t = pt1;
		pt1 = pt2;
		pt2 = t;
		
		var f = f1;
		f1 = f2;
		f2 = f;
		/*
		var sb = screenBuffer
		screenBuffer = screenBuffer2
		screenBuffer2 = sb
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
