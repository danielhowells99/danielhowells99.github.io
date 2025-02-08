import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"

//###---COMMON CODE---###

var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl");
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

const SKIPS = 3.0;
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
		aspect: gl.getUniformLocation(dataProgram, "uAspect"),
		dataSampler: gl.getUniformLocation(dataProgram, "uDataSampler"),
	},
};

const particleProgram = initShaderProgram(gl, 'shaders/renderLines.vert', 'shaders/renderLines.frag');
const particleProgramInfo = {
	program: particleProgram,
	attribLocations: {
		indexData: gl.getAttribLocation(particleProgram, "aIndexData"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(particleProgram, "uDataSampler"),
		freqSampler: gl.getUniformLocation(particleProgram, "uFreqSampler"),
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

const particle_num_sqd = 11;
const particle_num = particle_num_sqd*particle_num_sqd;
const particle_data = []
const index_data = []

for (let i = 0; i < particle_num; i++){
	particle_data.push(0.77*(-1+Math.random()*2))
	particle_data.push(0.77*(-1+Math.random()*2))
	let randAngle = Math.random()*6.2831853;
	particle_data.push(0.005*((i+1)/particle_num)*Math.cos(randAngle))
	particle_data.push(0.005*((i+1)/particle_num)*Math.sin(randAngle))
	let firstIndex = ((i%particle_num_sqd)+0.5)/particle_num_sqd;
	let secondIndex = (Math.floor(i/particle_num_sqd)+0.5)/particle_num_sqd;
	index_data.push(firstIndex)
	index_data.push(secondIndex)
	index_data.push(i/particle_num)
}

let lacedIndicies = laceArrays2D(index_data);
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lacedIndicies), gl.STATIC_DRAW);
setParticleIndexAttribute(gl, indexBuffer, particleProgramInfo)

var {textures,framebuffers} = prepare_textures_and_framebuffers(gl,particle_num_sqd,particle_data)

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, textures.dataTexture1);

gl.useProgram(dataProgram);
gl.uniform1f(dataProgramInfo.uniformLocations.aspect,canvas.width/canvas.height);
gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0); //Data located in TEXTURE0

gl.useProgram(particleProgram);
gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);

let f1 = framebuffers.framebuffer1
let f2 = framebuffers.framebuffer2

let pt1 = textures.dataTexture1
let pt2 = textures.dataTexture2

//AUDIO CODE
const audioCtx = new AudioContext();
console.log("sample_rate: " + audioCtx.sampleRate)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 1024;
analyser.smoothingTimeConstant = 0.7;

let mic = null

const bufferLength = analyser.frequencyBinCount;
const freqData = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(freqData);

let freqTex = createDataTexture(gl,freqData);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, freqTex);

navigator.mediaDevices
  .getUserMedia({
	  audio:{
		  sampleRate: 44100,
	  },
	  video:false
  })
  .then((stream) => useMic(stream))
  .catch((err) => {
    console.log(err)
	gl.clearColor(1.0,0.0,0.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT)
  });
  
function useMic(stream){
	console.log("did we get here?")
	mic = audioCtx.createMediaStreamSource(stream);
	mic.connect(analyser);
	analyser.disconnect()
	let startTime = new Date().getTime();
	const frameLimit = 60; // PAL/NTSC TV?
	const minDelta = 1.0/frameLimit;
	let frames = 0.0;

	function render() {
		
		let endTime = new Date().getTime();
		let delayMilliseconds = (endTime - startTime)/1000.0;
		
		//console.log(lacedIndicies);
		
		if (delayMilliseconds > 1.0/frameLimit){ //THROTTLE FRAMERATE
			
			startTime = endTime
			analyser.getByteFrequencyData(freqData)
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, freqTex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
				gl.UNSIGNED_BYTE, new Uint8Array(freqData));

			gl.useProgram(dataProgram);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, pt1);
			gl.bindFramebuffer(gl.FRAMEBUFFER, f2);
			gl.viewport(0, 0, particle_num_sqd, particle_num_sqd);
			gl.uniform1i(dataProgramInfo.uniformLocations.dataSampler, 0);
			gl.uniform1f(dataProgramInfo.uniformLocations.aspect,canvas.width/canvas.height);
			setPositionAttribute(gl, positionBuffer, dataProgramInfo) 
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			gl.useProgram(particleProgram);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.clearColor(0.0,0.0,0.0,1.0);
			gl.clear(gl.COLOR_BUFFER_BIT)
			gl.viewport(0, 0, scale*gl.canvas.width, scale*gl.canvas.height);
			gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
			gl.uniform1i(particleProgramInfo.uniformLocations.freqSampler, 1);
			setParticleIndexAttribute(gl,indexBuffer,particleProgramInfo)
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
			//gl.drawArrays(gl.POINTS, 0, particle_num_sqd*particle_num_sqd);  
			gl.drawArrays(gl.LINES, 0, lacedIndicies.length/2);  
			gl.disable(gl.BLEND)
			
			//console.log(lacedList);
			
			var t = pt1;
			pt1 = pt2;
			pt2 = t;
			
			var f = f1;
			f1 = f2;
			f2 = f;
			
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
}

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

function setParticleIndexAttribute(gl, buffer, programInfo) { //Sets verticies for rectangle to store to framebuffers
	const numComponents = 3; // pull out 2 values per iteration
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
	gl.enableVertexAttribArray(programInfo.attribLocations.indexData);
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

function createDataTexture(gl,freqData){
	let dataTexture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
                gl.UNSIGNED_BYTE, new Uint8Array(freqData));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return dataTexture1;
}

function setupUserInput(){
	
	function isTouchDevice() {
		return (('ontouchstart' in window) ||
			(navigator.maxTouchPoints > 0) ||
			(navigator.msMaxTouchPoints > 0));
	}

	if (isTouchDevice()){
		ontouchmove = function(e){mouse = {x: screenScale*e.touches[0].clientX/canvas.width, y: 1-screenScale*e.touches[0].clientY/canvas.height};mouseForce = 1.0;
			if(mic){
				mic.connect(audioCtx.destination);
			}
		}
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
		if (event.key == "m" || event.key == "M"){
			if(mic){
				mic.connect(audioCtx.destination);
			}
		}
	});

}

function laceArrays2D(list){
	let lacedList = [];
	for (let i = 0; i < list.length; i += 3){
		for (let j = i+3; j < list.length; j += 3*SKIPS){
			lacedList.push(list[i]);
			lacedList.push(list[i+1]);
			lacedList.push(list[i+2]);
			lacedList.push(list[j]);
			lacedList.push(list[j+1]);
			lacedList.push(list[j+2]);
		}
	}
	return lacedList;
}
