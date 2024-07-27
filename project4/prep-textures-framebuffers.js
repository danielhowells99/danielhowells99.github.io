export {prepare_textures_and_framebuffers}

function prepare_textures_and_framebuffers(gl,particleNumSqd,particle_positions,particle_velocities){
    let textures = _prepare_textures(gl,
        particleNumSqd,
        particle_positions,
        particle_velocities)
    let framebuffers = _prepare_buffers(gl,
        textures.positionTex1,
        textures.positionTex2,
        textures.velocityTex1,
        textures.velocityTex2)
    return {
        textures: textures,
        framebuffers: framebuffers
    }
}

function _prepare_textures(gl,particleNumSqd,particle_positions,particle_velocities) {

    let positionTex1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, positionTex1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particleNumSqd, particleNumSqd, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(particle_positions));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let positionTex2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, positionTex2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particleNumSqd, particleNumSqd, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(particle_positions));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let velocityTex1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, velocityTex1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particleNumSqd, particleNumSqd, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(particle_velocities));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let velocityTex2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, velocityTex2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, particleNumSqd, particleNumSqd, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(particle_velocities));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return {
        positionTex1: positionTex1,
        positionTex2: positionTex2,
        velocityTex1: velocityTex1,
        velocityTex2: velocityTex2,
    }
}

function _prepare_buffers(gl,ptex1,ptex2,vtex1,vtex2){

    var fb1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ptex1, 0); // attach tex1
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, vtex1, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    var fb2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ptex2, 0); // attach tex1
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, vtex2, 0); // attach tex1
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { // check this will actually work
        alert("this combination of attachments not supported");
    }

    return {
        fb1: fb1,
        fb2: fb2,
    }
}