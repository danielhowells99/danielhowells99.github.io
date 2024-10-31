import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";

var canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");
/*
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}
*/
let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
let partCol = [1-parts[1]/255,1-parts[2]/255,1-parts[3]/255]

let minCanvDim = 0.0;
let aspectRatio = canvas.width/canvas.height;
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);
	minCanvDim = Math.min(canvas.width,canvas.height);
	aspectRatio = canvas.width/canvas.height;
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
});

//###################################################################

const freqProgram = initShaderProgram(gl, 'shaders/frequencyStrip.vert', 'shaders/frequencyStrip.frag');
const displayFramebufferProgram = initShaderProgram(gl, 'shaders/displayFramebuffer.vert', 'shaders/displayFramebuffer.frag');

const freqProgramInfo = {
	program: freqProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(freqProgram, "aVertexPosition"),
	},
	uniformLocations: {
		dataSampler: gl.getUniformLocation(freqProgram, "uDataSampler"),
	},
};

const displayFramebufferProgramInfo = {
	program: displayFramebufferProgram,
	attribLocations: {
		vertexPosition: gl.getAttribLocation(displayFramebufferProgram, "aVertexPosition"),
	},
	uniformLocations: {
		framebufferTexSampler: gl.getUniformLocation(displayFramebufferProgram, "uFbTexture"),
	},
};

const audioCtx = new AudioContext();
console.log("sample_rate: " + audioCtx.sampleRate)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.89;

let mic = null

const bufferLength = analyser.frequencyBinCount;
const freqData = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(freqData);

let freqTex = createDataTexture(gl,freqData);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, freqTex);
gl.useProgram(freqProgram)
gl.uniform1i(freqProgramInfo.uniformLocations.dataSampler,0);

//set verticies for rectangle to render particles to
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
setPositionAttribute(gl, positionBuffer, freqProgramInfo)
setPositionAttribute(gl, positionBuffer, displayFramebufferProgramInfo)

let screenBuffer1 = null;

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
	const frameLimit = 10; // PAL/NTSC TV?
	const minDelta = 0.0//1.0/frameLimit;
	const maxFrames = 0;
	function render() {
		
		let endTime = new Date().getTime();
		let delayMilliseconds = (endTime - startTime)/1000.0;
		
		if (delayMilliseconds > minDelta){ //THROTTLE FRAMERATE
			startTime = endTime
			
			//DRAW CODE HERE
			analyser.getByteFrequencyData(freqData)
			
			gl.useProgram(freqProgram)

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, freqTex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
				gl.UNSIGNED_BYTE, new Uint8Array(freqData));
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, freqTex);

			gl.uniform1i(freqProgramInfo.uniformLocations.dataSampler,0);
			
			screenBuffer1 = createScreenFramebuffer(gl)
			gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
			gl.viewport(0, 0, canvas.width, canvas.height);
			//gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			//console.log(dataArray)

			gl.useProgram(displayFramebufferProgram)
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.uniform1i(displayFramebufferProgramInfo.uniformLocations.framebufferTexSampler, 2);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

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
                gl.UNSIGNED_BYTE, new Uint8Array(canvas.width*canvas.height*4).fill(50));
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

	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, screenTexture);

	return {
		texture: screenTexture,
		framebuffer: framebuffer,
	}
}
