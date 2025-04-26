import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {getPostProcessingFilter,createScreenFramebuffer} from "../libraries/post-processing.js"
import {initializeUserInput} from "../libraries/user-input.js"

var canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
let partCol = [1-parts[1]/255,1-parts[2]/255,1-parts[3]/255]

let aspectRatio = canvas.width/canvas.height;
let logSelect = 1.0;
let invertFreq = 0.0;
let circle_toggle = 1.0;
let transformToggle = 0.0;
/*
const affineFilter = getPostProcessingFilter(gl,"AFFINE")
const gaussian3Filter = getPostProcessingFilter(gl,"GAUSSIAN3")
const gaussian5Filter = getPostProcessingFilter(gl,"GAUSSIAN5")
const TransformFilter = getPostProcessingFilter(gl,"TRANSFORM")
const maximumFilter = getPostProcessingFilter(gl,"MAXIMUM")
const paintFilter = getPostProcessingFilter(gl,"PAINT8")
const ditherFilter = getPostProcessingFilter(gl,"DITHER")
*/
const colourFilter = getPostProcessingFilter(gl,"COLOUR")

let freqStat = 0.0
let freqStat2 = 0.0

let scale = 2;
let screenBuffer1 = createScreenFramebuffer(gl,scale);
let screenBuffer2 = createScreenFramebuffer(gl,scale);
/*
let screenBuffer3 = createScreenFramebuffer(gl,1.0);
let screenBuffer4 = createScreenFramebuffer(gl,1.0);
*/

let userInput = initializeUserInput(canvas)
    
function resizeCanvas() {
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth;
	canvas.height = displayHeight;

	gl.viewport(0,0,canvas.width,canvas.height);
	aspectRatio = canvas.width/canvas.height;
	
	screenBuffer1 = createScreenFramebuffer(gl,scale);
	screenBuffer2 = createScreenFramebuffer(gl,scale);
	/*
	screenBuffer3 = createScreenFramebuffer(gl,1.0);
	screenBuffer4 = createScreenFramebuffer(gl,1.0);
	*/

	userInput = initializeUserInput(canvas)
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.addEventListener("keypress", function onEvent(event) {
	if (event.key == "m" || event.key == "M"){
		if(mic){
			mic.connect(audioCtx.destination);
		}
	}
	if (event.key == "l" || event.key == "L"){
		logSelect = logSelect^1;
	}
	if (event.key == "b" || event.key == "B"){
		invertFreq = invertFreq^1;
	}
	if (event.key == "t" || event.key == "T"){
		transformToggle = transformToggle^1;
	}
	if (event.key == "o" || event.key == "O"){
		resizeCanvas()
		circle_toggle = circle_toggle^1;
	}
});

//###################################################################

const circle_freqProgram = initShaderProgram(gl, 'shaders/circle_frequencyStrip.vert', 'shaders/circle_frequencyStrip.frag');

const circle_freqProgramInfo = {
	program: circle_freqProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(circle_freqProgram, "aVertexPosition"),
		texPosition: gl.getAttribLocation(circle_freqProgram, "aTexPosition"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(circle_freqProgram, "uDataSampler"),
		logSelect: gl.getUniformLocation(circle_freqProgram,"uLogSelect"),
		rotMatrix: gl.getUniformLocation(circle_freqProgram,"uRotMatrix"),
		aspect: gl.getUniformLocation(circle_freqProgram,"uAspect"),
		invertFreq: gl.getUniformLocation(circle_freqProgram,"uInvertFreq"),
	},
};

const linear_freqProgram = initShaderProgram(gl, 'shaders/linear_frequencyStrip.vert', 'shaders/linear_frequencyStrip.frag');
const linear_displayFramebufferProgram = initShaderProgram(gl, 'shaders/linear_displayFramebuffer.vert', 'shaders/linear_displayFramebuffer.frag');

const linear_freqProgramInfo = {
	program: linear_freqProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(linear_freqProgram, "aVertexPosition"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(linear_freqProgram, "uDataSampler"),
		shiftVal: gl.getUniformLocation(linear_freqProgram,"uShiftVal"),
		logSelect: gl.getUniformLocation(linear_freqProgram,"uLogSelect"),
		invertFreq: gl.getUniformLocation(linear_freqProgram,"uInvertFreq"),
		freqStat: gl.getUniformLocation(linear_freqProgram,"uFreqStat"),
		transformToggle: gl.getUniformLocation(linear_freqProgram,"uTransformToggle"),
	},
};

const linear_displayFramebufferProgramInfo = {
	program: linear_displayFramebufferProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(linear_displayFramebufferProgram, "aVertexPosition"),
	},
	uniformLocations: {
		framebufferTexSampler: gl.getUniformLocation(linear_displayFramebufferProgram, "uFbTexture"),
		shiftVal: gl.getUniformLocation(linear_displayFramebufferProgram,"uShiftVal"),
	},
};

const audioCtx = new AudioContext({sampleRate: 44100});
console.log("sample_rate: " + audioCtx.sampleRate)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 1024;
analyser.smoothingTimeConstant = 0.65;

let mic = null
const average = list => list.reduce((prev, curr) => prev + curr) / list.length;

const bufferLength = analyser.frequencyBinCount;
const freqData = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(freqData);

let freqTex = createDataTexture(gl,freqData);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, freqTex);

//---------------------
const freqSlicePositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, freqSlicePositionBuffer);
let holeSize = 0.1
const rotval = 1.5*Math.PI/720.0;
const freqSlicePositions = [rotval, 1.0, -rotval, 1.0, holeSize*rotval, holeSize, -holeSize*rotval, holeSize];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(freqSlicePositions), gl.STATIC_DRAW);

const freqSliceTexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, freqSliceTexBuffer);
const freqSliceTexPositions = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(freqSliceTexPositions), gl.STATIC_DRAW);
//-----------------------

//---------------------
const linearPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, linearPositionBuffer);
const positions = [1.0, 1.0, 0.9, 1.0, 1.0, -1.0, 0.9, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, linearPositionBuffer, linear_freqProgramInfo)
//--------------------

const canvasPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, canvasPositionBuffer);
const canvasPositions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(canvasPositions), gl.STATIC_DRAW);
setPositionAttribute(gl, canvasPositionBuffer, linear_displayFramebufferProgramInfo)

navigator.mediaDevices
  .getUserMedia({
	  audio:{
		  sampleRate: audioCtx.sampleRate,
	  },
	  video:false
  })
  .then((stream) => useMic(stream))
  .catch((err) => {
    console.log(err)
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
		
		if (delayMilliseconds > minDelta){ //THROTTLE FRAMERATE
			frames++;
			startTime = endTime
			
			//DRAW CODE HERE
			analyser.getByteFrequencyData(freqData)
			if (circle_toggle){
				circleVisualizer()
			} else {
				linearVisualizer()
			}
			// sb1 ---> filter stack
			//ditherFilter.applyFilter(gl,screenBuffer1.texture,screenBuffer3.framebuffer)
			//gaussian5Filter.applyFilter(gl,screenBuffer3.texture,screenBuffer4.framebuffer)
			//affineFilter.setPassThrough(gl)
			//affineFilter.applyFilter(gl,screenBuffer1.texture,screenBuffer4.framebuffer)
			colourFilter.applyFilter(gl,screenBuffer1.texture,null)

			//-----
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
	function circleVisualizer(){
		let rota = Math.PI*frames/720.0
		let sina = Math.sin(rota)
		let cosa = Math.cos(rota)
		let rotMatrix = [cosa,-sina,sina,cosa]
	
		//TO FB1
		
		gl.useProgram(circle_freqProgram)
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, freqTex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
			gl.UNSIGNED_BYTE, new Uint8Array(freqData));
		

		gl.uniform1i(circle_freqProgramInfo.uniformLocations.dataSampler,0);
		gl.uniform1f(circle_freqProgramInfo.uniformLocations.aspect, aspectRatio);

		gl.uniform1i(circle_freqProgramInfo.uniformLocations.logSelect, logSelect);
		gl.uniform1i(circle_freqProgramInfo.uniformLocations.invertFreq, invertFreq);
		gl.uniformMatrix2fv(circle_freqProgramInfo.uniformLocations.rotMatrix, false, rotMatrix);
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
		gl.viewport(0, 0, screenBuffer1.width, screenBuffer1.height);
	
		setPositionAttribute(gl, freqSlicePositionBuffer, circle_freqProgramInfo)
		setTexPositionAttribute(gl, freqSliceTexBuffer, circle_freqProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//console.log(dataArray)

		return 0
	}
	function linearVisualizer(){
		//TO FB1
		let shiftVal = scale*1.0/canvas.width;

		gl.useProgram(linear_freqProgram)
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, freqTex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
			gl.UNSIGNED_BYTE, new Uint8Array(freqData));
		

		//console.log(freqData.length)

		freqStat += 0.1*(Math.max(...freqData)/256 - freqStat);
		freqStat2 += 0.1*(Math.log(1.0+10.0*average(freqData)/256) - freqStat2);
		//console.log(freqStat)
		gl.uniform2fv(linear_freqProgramInfo.uniformLocations.freqStat, [freqStat,freqStat2]);

		gl.uniform1i(linear_freqProgramInfo.uniformLocations.dataSampler,0);
		gl.uniform1f(linear_freqProgramInfo.uniformLocations.shiftVal, shiftVal);
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.logSelect, logSelect);
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.invertFreq, invertFreq);
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.transformToggle, transformToggle);
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
		gl.viewport(0, 0, screenBuffer1.width, screenBuffer1.height);
		setPositionAttribute(gl, linearPositionBuffer, linear_freqProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//console.log(dataArray)
		
		//TO FB2
		gl.useProgram(linear_displayFramebufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer2.framebuffer);
		gl.viewport(0, 0, screenBuffer2.width, screenBuffer2.height);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer1.texture);
		gl.uniform1i(linear_displayFramebufferProgramInfo.uniformLocations.framebufferTexSampler, 1);
		gl.uniform1f(linear_displayFramebufferProgramInfo.uniformLocations.shiftVal, shiftVal);
		setPositionAttribute(gl, canvasPositionBuffer, linear_displayFramebufferProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		let f = screenBuffer2
		screenBuffer2 = screenBuffer1
		screenBuffer1 = f
		
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

function setTexPositionAttribute(gl, buffer, programInfo) { //Sets verticies for rectangle to store to framebuffers
	const numComponents = 2; // pull out 2 values per iteration
	const type = gl.FLOAT; // the data in the buffer is 32bit floats
	const normalize = false; // normalize
	const stride = 0; // how many bytes to get from one set of values to the next
	// 0 = use type and numComponents above
	const offset = 0; // how many bytes inside the buffer to start from
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		programInfo.attribLocations.texPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.texPosition);
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
