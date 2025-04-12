import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {prepare_textures_and_framebuffers} from "./prep-textures-framebuffers.js"
import {getPostProcessingFilter,createScreenFramebuffer} from "../libraries/post-processing.js"
import {initializeUserInput} from "../libraries/user-input.js"

//###---COMMON CODE---###

var canvas = document.querySelector("canvas");

const gl = canvas.getContext("webgl");
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
	alert('need OES_texture_float');
}

const affineFilter = getPostProcessingFilter(gl,"AFFINE")
const copyFilter = getPostProcessingFilter(gl,"COPY")
const dilateFilter = getPostProcessingFilter(gl,"DILATE")
const gaussian3Filter = getPostProcessingFilter(gl,"GAUSSIAN3")
const gaussian5Filter = getPostProcessingFilter(gl,"GAUSSIAN5")
const colourFilter = getPostProcessingFilter(gl,"COLOUR")
const transformFilter = getPostProcessingFilter(gl,"TRANSFORM")
const maximumFilter = getPostProcessingFilter(gl,"MAXIMUM")
const multiplyFilter = getPostProcessingFilter(gl,"MULTIPLY")
const paintFilter = getPostProcessingFilter(gl,"PAINT8")
const ditherFilter = getPostProcessingFilter(gl,"DITHER")
const luminanceFilter = getPostProcessingFilter(gl,"LUMINANCE")

const SKIPS = 2.0;
let scale = 2.0;
let screenScale = 1.0;
let screenBuffer1 = createScreenFramebuffer(gl,scale,gl.LINEAR);
let screenBuffer2 = createScreenFramebuffer(gl,scale,gl.LINEAR);
let screenBuffer3 = createScreenFramebuffer(gl,1.0,gl.LINEAR);
let screenBuffer4 = createScreenFramebuffer(gl,1.0,gl.LINEAR);
let aspectRatio = canvas.width/canvas.height;

let userInput = initializeUserInput(canvas,false)

function resizeCanvas() {
	
	let displayWidth = window.innerWidth;
	let displayHeight = window.innerHeight;
	canvas.style.width = displayWidth + 'px';
	canvas.style.height = displayHeight + 'px';
	canvas.width = displayWidth * screenScale;
	canvas.height = displayHeight * screenScale;

	screenBuffer1 = createScreenFramebuffer(gl,scale,gl.LINEAR);
	screenBuffer2 = createScreenFramebuffer(gl,scale,gl.LINEAR);
	screenBuffer3 = createScreenFramebuffer(gl,1.0,gl.LINEAR);
	screenBuffer4 = createScreenFramebuffer(gl,1.0,gl.LINEAR);
	aspectRatio = canvas.width/canvas.height;

	userInput = initializeUserInput(canvas,false)
	
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let logFlag = 0.0;

document.addEventListener("keypress", function onEvent(event) {
	if (event.key == "l" || event.key == "L"){
		logFlag = logFlag^1;
	}
	if (event.key == "m" || event.key == "M"){
		if(mic){
			audioCtx.resume()
			mic.connect(audioCtx.destination);
		}
	}
});

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
		logFlag: gl.getUniformLocation(particleProgram, "uLogFlag"),
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
	
	
	/*
	let angle = (i/particle_num)*6.2831853;
	particle_data.push(0.77*Math.cos(angle))
	particle_data.push(0.77*Math.sin(angle))
	particle_data.push(0)
	particle_data.push(0)
	*/
	
	/*
	let angle = (i/particle_num)
	particle_data.push(0.8*(1-angle)*Math.cos(3.14*i))
	particle_data.push(0.0)
	particle_data.push(0)
	particle_data.push(-0.025*(0.2+0.8*angle))
	*/
	
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
const audioCtx = new AudioContext({sampleRate: 44100});
console.log("sample_rate: " + audioCtx.sampleRate)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 2048;
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

			let fadeCoeff = 0.999
			affineFilter.setAffineTransform(gl,[fadeCoeff,fadeCoeff,fadeCoeff,1],[0.02,0.02,0.02,0.0])
			//affineFilter.setAffineTransform(gl,[0.88,0.88,0.88,1])
			affineFilter.applyFilter(gl,screenBuffer2.texture,screenBuffer1.framebuffer,scale)

			gl.useProgram(particleProgram);
			gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
			gl.viewport(0, 0, scale*gl.canvas.width, scale*gl.canvas.height);
			gl.uniform1i(particleProgramInfo.uniformLocations.dataSampler, 0);
			gl.uniform1i(particleProgramInfo.uniformLocations.freqSampler, 1);
			gl.uniform1f(particleProgramInfo.uniformLocations.logFlag, logFlag);
			setParticleIndexAttribute(gl,indexBuffer,particleProgramInfo)
			gl.enable(gl.BLEND)

			gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
			//gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE)


			//gl.drawArrays(gl.POINTS, 0, particle_num_sqd*particle_num_sqd);  
			gl.drawArrays(gl.LINES, 0, lacedIndicies.length/3);  
			gl.disable(gl.BLEND)

			copyFilter.applyFilter(gl,screenBuffer1.texture,screenBuffer2.framebuffer,scale)

			gaussian3Filter.applyFilter(gl,screenBuffer2.texture,screenBuffer3.framebuffer)

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.clearColor(0.02,0.0,0.07,1.0);
			gl.clear(gl.COLOR_BUFFER_BIT)

			dilateFilter.applyFilter(gl,screenBuffer3.texture,null)
			
			
			//console.log(lacedList);
			
			var t = pt1;
			pt1 = pt2;
			pt2 = t;
			
			var f = f1;
			f1 = f2;
			f2 = f;
			
			//END DRAW CODE

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
