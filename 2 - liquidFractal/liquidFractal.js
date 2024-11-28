import {initShaderProgram} from "../libraries/my-shader-util.js";

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


	let scale = 1.0;
	let screenBuffer = createScreenFramebuffer(gl,scale);

	function resizeCanvas() {
		let displayWidth = window.innerWidth;
		let displayHeight = window.innerHeight;
		canvas.style.width = displayWidth + 'px';
		canvas.style.height = displayHeight + 'px';
		canvas.width = displayWidth;
		canvas.height = displayHeight;
		
		screenBuffer = createScreenFramebuffer(gl,scale);
		window.scrollTo(0,1)
	}

	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();

	let capFlag = 0;
	document.addEventListener("keypress", function onEvent(event) {
		if (event.key == "p" || event.key == "P"){
			capFlag = 1;
		}
	});
	
	const liquidShaderProgram = initShaderProgram(gl, 'shaders/liquidShader.vert', 'shaders/liquidShader.frag');
	const screenSpaceProgram = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/screenSpaceShader.frag');
	
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
		},
	};

	const screenSpaceProgramInfo = {
		program: screenSpaceProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(screenSpaceProgram, "aVertexPosition"),
		},
		uniformLocations: {
			framebufferTexture: gl.getUniformLocation(screenSpaceProgram, "uFbTexture"),
			screenDimensions: gl.getUniformLocation(screenSpaceProgram, "uScreenDimensions"),
			partColor: gl.getUniformLocation(screenSpaceProgram, "uPartColor"),
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
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, screenBuffer.framebuffer);
		gl.viewport(0, 0, scale*canvas.width, scale*canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.useProgram(screenSpaceProgram)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, screenBuffer.texture);
		gl.uniform1i(screenSpaceProgramInfo.uniformLocations.framebufferTexture, 3);
		gl.uniform2fv(screenSpaceProgramInfo.uniformLocations.screenDimensions, [canvas.width, canvas.height]);
		setPositionAttribute(gl, positionBuffer, screenSpaceProgramInfo) 
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		timeParam += 0.0004;
		if (timeParam > 2.0){
			timeParam = 0.0;
		}

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

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);

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
