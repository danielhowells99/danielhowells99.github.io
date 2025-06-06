import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";
import {getPostProcessingFilter,createScreenFramebuffer} from "../libraries/post-processing.js"
import {initializeUserInput} from "../libraries/user-input.js"

let bgdCol = getComputedStyle(document.querySelector('body')).backgroundColor
let parts = bgdCol.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
let partCol = [1-parts[1]/255,1-parts[2]/255,1-parts[3]/255]

main();  
function main() {

	const canvas = document.querySelector("#glcanvas");
	const gl = canvas.getContext("webgl");

	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}
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



	let scale = 1.0;
	let screenScale = 1.0;
	let screenBuffer1 = createScreenFramebuffer(gl,scale,gl.LINEAR,"one");
	//let screenBuffer2 = createScreenFramebuffer(gl,scale);
	let userInput = initializeUserInput(canvas,true)

	function resizeCanvas() {
		let displayWidth = window.innerWidth;
		let displayHeight = window.innerHeight;
		canvas.style.width = displayWidth + 'px';
		canvas.style.height = displayHeight + 'px';
		canvas.width = displayWidth;
		canvas.height = displayHeight;
		
		screenBuffer1 = createScreenFramebuffer(gl,scale,gl.LINEAR,"one");
		//screenBuffer2 = createScreenFramebuffer(gl,scale);
		userInput = initializeUserInput(canvas,true)
		window.scrollTo(0,1)
	}

	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	
	const liquidShaderProgram = initShaderProgram(gl, 'shaders/liquidShader.vert', 'shaders/liquidShader.frag');
	
	const liquidShaderProgramInfo = {
		program: liquidShaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(liquidShaderProgram, "aVertexPosition"),
		},
		uniformLocations: {
			timeParam: gl.getUniformLocation(liquidShaderProgram, "uTimeParam"),
			aspect: gl.getUniformLocation(liquidShaderProgram, "uAspect"),
			uSampler: gl.getUniformLocation(liquidShaderProgram, "uSampler"),
			partColor: gl.getUniformLocation(liquidShaderProgram, "uPartColor"),
			mouseLoc: gl.getUniformLocation(liquidShaderProgram, "uMouseLoc"),
		},
	};
	
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	let timeParam = 0.1;
	
	function render(now) {
		
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

		setPositionAttribute(gl, positionBuffer, liquidShaderProgramInfo);
		gl.useProgram(liquidShaderProgramInfo.program);
		
		gl.uniform1f(
			liquidShaderProgramInfo.uniformLocations.timeParam,
			timeParam,
		);
		gl.uniform1f(
			liquidShaderProgramInfo.uniformLocations.aspect,
			aspect,
		);
		gl.uniform3fv(
			liquidShaderProgramInfo.uniformLocations.partColor,
			partCol,
		);
		gl.uniform2fv(liquidShaderProgramInfo.uniformLocations.mouseLoc,[(2.0*userInput.mouse_location.x-1.0),(2.0*userInput.mouse_location.y-1.0)]);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer1.framebuffer);
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		colourFilter.applyFilter(gl,screenBuffer1.texture,null)
		
		if (userInput.mouse_force){
			timeParam += 0.0002;
		}
		if (timeParam > 1.0){
			timeParam = 0.0;
		}

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

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

function setPositionAttribute(gl, buffer, programInfo) {
	const numComponents = 2; // pull out 2 values per iteration
	const type = gl.FLOAT; // the data in the buffer is 32bit floats
	const normalize = false; // don't normalize
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
