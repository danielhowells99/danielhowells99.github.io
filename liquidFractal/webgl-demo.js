import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import {loadShader, initShaderProgram, loadTexture} from "../libraries/my-shader-util.js";

let squareRotation = 0.0;
let deltaTime = 0;

main();
function main() {

	const canvas = document.querySelector("#glcanvas");

	// Initialize the GL context
	const gl = canvas.getContext("webgl");

	// Only continue if WebGL is available and working
	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}

	function resizeCanvas() {
		let displayWidth = window.innerWidth;
		let displayHeight = window.innerHeight;
		let scale = 2;
		canvas.style.width = displayWidth + 'px';
		canvas.style.height = displayHeight + 'px';
		canvas.width = displayWidth * scale;
		canvas.height = displayHeight * scale;
		
		gl.viewport(0,0,canvas.width,canvas.height);
		window.scrollTo(0,1)
	}

	window.addEventListener("resize", resizeCanvas);
	
	resizeCanvas();

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT);
	

	const vsSource = 'shaders/shader.vert'
	const fsSource = 'shaders/shader.frag'
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
	
	// Collect all the info needed to use the shader program.
	// Look up which attribute our shader program is using
	// for aVertexPosition and look up uniform locations.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
			vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
			texCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			timeParam: gl.getUniformLocation(shaderProgram, "uTimeParam"),
			aspect: gl.getUniformLocation(shaderProgram, "uAspect"),
			uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
		},
	};
	
	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	const buffers = initBuffers(gl);
	
	/*
	// Load texture
	const texture = loadTexture(gl, "galaxy.png");
	// Flip image pixels into the bottom-to-top order that WebGL expects.
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	*/

	// Draw the scene
	let then = 0;

	// Draw the scene repeatedly
	function render(now) {
		
		now *= 0.001; // convert to seconds
		deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, buffers, squareRotation);
		squareRotation += deltaTime;

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}
