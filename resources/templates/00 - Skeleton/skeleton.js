import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";

//###---COMMON CODE---###

var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl");
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

let scale = 1.0;
let screenScale = 1.0;
//let screenBuffer = createScreenFramebuffer(gl,scale);
let aspectRatio = canvas.width/canvas.height;

function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;
	
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

const dataProgram = initShaderProgram(gl, 'shaders/updateDataTextures.vert', 'shaders/updateDataTextures.frag');
const dataProgramInfo = {
	program: dataProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(dataProgram, "aVertexPosition"),
	},
	uniformLocations: {
		screenDimensions: gl.getUniformLocation(dataProgram, "uScreenDimensions"),
	},
};

//set verticies for rectangle to render particles to
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, dataProgramInfo)

let startTime = new Date().getTime();
const frameLimit = 90; // PAL/NTSC TV?

const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
let timesList = [];

function render() {
	
	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
	
	if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE
		
		startTime = endTime

		//DRAW CODE HERE
		
		
		
		
		//END DRAW CODE

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

function createScreenFramebuffer(gl,size){
	let screenTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size*canvas.width, size*canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(size*size*canvas.width*canvas.height*4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
