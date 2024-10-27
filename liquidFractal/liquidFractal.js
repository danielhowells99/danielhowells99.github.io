import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";

let squareRotation = 0.0;
let deltaTime = 0;

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

	function resizeCanvas() {
		let displayWidth = window.innerWidth;
		let displayHeight = window.innerHeight;
		let scale = 1;
		canvas.style.width = displayWidth + 'px';
		canvas.style.height = displayHeight + 'px';
		canvas.width = displayWidth * scale;
		canvas.height = displayHeight * scale;
		
		gl.viewport(0,0,canvas.width,canvas.height);
		window.scrollTo(0,1)
	}

	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
	
	const vsSource = 'shaders/shader.vert'
	const fsSource = 'shaders/shader.frag'
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
	
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
		},
		uniformLocations: {
			timeParam: gl.getUniformLocation(shaderProgram, "uTimeParam"),
			aspect: gl.getUniformLocation(shaderProgram, "uAspect"),
			uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
			partColor: gl.getUniformLocation(shaderProgram, "uPartColor"),
		},
	};
	
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.useProgram(programInfo.program);
	
	let then = 0;
	let timeParam = 0.1;
	
	function render(now) {
		
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

		setPositionAttribute(gl, positionBuffer, programInfo);
		gl.useProgram(programInfo.program);
		
		gl.uniform1f(
			programInfo.uniformLocations.timeParam,
			timeParam,
		);
		gl.uniform1f(
			programInfo.uniformLocations.aspect,
			aspect,
		);
		gl.uniform3fv(
			programInfo.uniformLocations.partColor,
			partCol,
		);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		timeParam += 0.004;

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
