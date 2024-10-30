export {prepare_textures_and_framebuffers}

function prepare_textures_and_framebuffers(gl,freqData){
    let textures = _prepare_textures(gl,freqData)
    let framebuffers = _prepare_buffers(gl)
    return {
        textures: textures,
        framebuffers: framebuffers
    }
}

function _prepare_textures(gl,freqData) {

    let dataTexture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTexture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, freqData.length, 1, 0, gl.LUMINANCE,
                gl.UNSIGNED_BYTE, new Uint8Array(freqData));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
    return {
        dataTexture1: dataTexture1,
    }
}

function _prepare_buffers(gl){

    var framebuffer1 = gl.createFramebuffer();
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    var framebuffer2 = gl.createFramebuffer();
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    return {
        framebuffer1: framebuffer1,
        framebuffer2: framebuffer2,
    }
}