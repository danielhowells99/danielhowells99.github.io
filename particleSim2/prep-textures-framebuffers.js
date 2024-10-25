export {prepare_textures_and_framebuffers}

function prepare_textures_and_framebuffers(gl,particle_num,particle_data,size_data){
    let textures = _prepare_textures(gl,
        particle_num,
        particle_data,size_data)
    let framebuffers = _prepare_buffers(gl,
        textures.dataTexture1,
        textures.dataTexture2)
    return {
        textures: textures,
        framebuffers: framebuffers
    }
}

function _prepare_textures(gl,particle_num,particle_data,size_data) {

    let dataTexture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particle_num, particle_num, 0, gl.RGBA,
                gl.FLOAT, new Float32Array(particle_data));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let dataTexture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particle_num, particle_num, 0, gl.RGBA,
                gl.FLOAT, new Float32Array(particle_data));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let initTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, initTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particle_num, particle_num, 0, gl.RGBA,
                gl.FLOAT, new Float32Array(particle_data));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	/*
	let sizeTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sizeTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particle_num, particle_num, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(size_data));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	*/
    return {
        dataTexture1: dataTexture1,
        dataTexture2: dataTexture2,
        initTex: initTex,
		//sizeTex: sizeTex,
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