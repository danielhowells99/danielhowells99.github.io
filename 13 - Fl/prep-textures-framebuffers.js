export {prepare_textures_and_framebuffers}

function prepare_textures_and_framebuffers(gl,canvas){
    let textures = _prepare_textures(gl,
        canvas)
    let framebuffers = _prepare_buffers(gl,
        textures.dataTexture1,
        textures.dataTexture2)
    return {
        textures: textures,
        framebuffers: framebuffers
    }
}

function _prepare_textures(gl,canvas) {
	
	
	let tempData = [];
	for (let i = 0;i<canvas.width*canvas.height;i++){
		tempData.push(255)
		tempData.push(255)
		tempData.push(255)
		let val = Math.random();
		tempData.push(255*val*val)
	}
	let initData = new Uint8Array(tempData);
	

    let dataTexture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE,initData);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	

    let dataTexture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, initData);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	
    return {
        dataTexture1: dataTexture1,
        dataTexture2: dataTexture2,
    }
}

function _prepare_buffers(gl,data_texture1,data_texture2){

    var framebuffer1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, data_texture1, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    var framebuffer2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, data_texture2, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    return {
        framebuffer1: framebuffer1,
        framebuffer2: framebuffer2,
    }
}