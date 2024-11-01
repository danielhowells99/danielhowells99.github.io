import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";

var canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
let partCol = [1-parts[1]/255,1-parts[2]/255,1-parts[3]/255]

let aspectRatio = canvas.width/canvas.height;
let logSelect = 0.0;
let invertFreq = 0.0;
let circle_toggle = 1.0;

let screenBuffer1 = createScreenFramebuffer(gl);
let screenBuffer2 = createScreenFramebuffer(gl);

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);
	aspectRatio = canvas.width/canvas.height;
	
	screenBuffer1 = createScreenFramebuffer(gl);
	screenBuffer2 = createScreenFramebuffer(gl);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let capFlag = 0;
document.addEventListener("keypress", function onEvent(event) {
	if (event.key == "p" || event.key == "P"){
		capFlag = 1;
	}
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
	if (event.key == "o" || event.key == "O"){
		resizeCanvas()
		circle_toggle = circle_toggle^1;
	}
});

//###################################################################

const circle_freqProgram = initShaderProgram(gl, 'shaders/circle_frequencyStrip.vert', 'shaders/circle_frequencyStrip.frag');
const circle_displayFramebufferProgram = initShaderProgram(gl, 'shaders/circle_displayFramebuffer.vert', 'shaders/circle_displayFramebuffer.frag');

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

const circle_displayFramebufferProgramInfo = {
	program: circle_displayFramebufferProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(circle_displayFramebufferProgram, "aVertexPosition"),
	},
	uniformLocations: {
		framebufferTexSampler: gl.getUniformLocation(circle_displayFramebufferProgram, "uFbTexture"),
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

const audioCtx = new AudioContext();
console.log("sample_rate: " + audioCtx.sampleRate)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;

let mic = null

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
		  sampleRate: 44100,
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

			//-----
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
		gl.viewport(0, 0, canvas.width, canvas.height);
	
		setPositionAttribute(gl, freqSlicePositionBuffer, circle_freqProgramInfo)
		setTexPositionAttribute(gl, freqSliceTexBuffer, circle_freqProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//console.log(dataArray)
		
		//TO SCREEN
		gl.useProgram(circle_displayFramebufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer1.texture);
		gl.uniform1i(circle_displayFramebufferProgramInfo.uniformLocations.framebufferTexSampler, 1);
		setPositionAttribute(gl, canvasPositionBuffer, circle_displayFramebufferProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		return 0
	}
	function linearVisualizer(){
		//TO FB1
		let shiftVal = 2.0/canvas.width;

		gl.useProgram(linear_freqProgram)
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, freqTex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
			gl.UNSIGNED_BYTE, new Uint8Array(freqData));
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.dataSampler,0);
		gl.uniform1f(linear_freqProgramInfo.uniformLocations.shiftVal, shiftVal);
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.logSelect, logSelect);
		gl.uniform1i(linear_freqProgramInfo.uniformLocations.invertFreq, invertFreq);
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
		gl.viewport(0, 0, canvas.width, canvas.height);
		setPositionAttribute(gl, linearPositionBuffer, linear_freqProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//console.log(dataArray)
		
		//TO FB2
		gl.useProgram(linear_displayFramebufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer2.framebuffer);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer1.texture);
		gl.uniform1i(linear_displayFramebufferProgramInfo.uniformLocations.framebufferTexSampler, 1);
		gl.uniform1f(linear_displayFramebufferProgramInfo.uniformLocations.shiftVal, shiftVal);
		setPositionAttribute(gl, canvasPositionBuffer, linear_displayFramebufferProgramInfo)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		//TO SCREEN
		gl.useProgram(linear_displayFramebufferProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer2.texture);
		gl.uniform1i(linear_displayFramebufferProgramInfo.uniformLocations.framebufferTexSampler, 2);
		gl.uniform1f(linear_displayFramebufferProgramInfo.uniformLocations.shiftVal, 0.0);
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return dataTexture1;
}

function createScreenFramebuffer(gl){
	let screenTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(canvas.width*canvas.height*4));
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
