import {loadShader, initShaderProgram, loadTexture} from "./my-shader-util.js";

function getPostProcessingFilter(gl,name){
    let filter = null;
    switch (name){
        case "COLOUR":
            filter = new ColourFilter(gl,"COLOUR")
            return filter
        case "AFFINE":
            filter = new AffineFilter(gl,"AFFINE")
            return filter
        case "TRANSFORM":
            filter = new TransformFilter(gl,"TRANSFORM")
            return filter
        case "GAUSSIAN3":
            filter = new Gaussian3(gl,"GAUSSIAN3")
            return filter
        case "GAUSSIAN5":
            filter = new Gaussian5(gl,"GAUSSIAN5")
            return filter
        case "PAINT4":
            filter = new Paint4(gl,"PAINT4")
            return filter
        case "PAINT8":
            filter = new Paint8(gl,"PAINT8")
            return filter
        case "DITHER":
            filter = new Dither(gl,"DITHER")
            return filter
        case "MAXIMUM":
            filter = new MaximumFilter(gl,"MAXIMUM")
            return filter
        default: 
            console.log("getPostProcessingFilter() - invalid filter name")
            return filter;
    }
}

function createScreenFramebuffer(gl,size,name = "default"){
	let screenTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size*gl.canvas.width, size*gl.canvas.height, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array(size*size*gl.canvas.width*gl.canvas.height*4));
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
        name: name,
	}
}

class PostProcessingFilter{
    constructor(gl,name){
        this.name = name
        this.program = null
        this.program_info = null
        this.position_buffer = this.initializePositionBuffer(gl);
    };

    initializePositionBuffer(gl) {
        const position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return position_buffer
    }

    setPositionAttribute(gl,programInfo,position_buffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertex_position,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertex_position);
    }
}

class UnitaryFilter extends PostProcessingFilter{
    constructor(gl,name){
        super(gl,name)
    }

    applyFilter(gl,source_texture,dest_framebuffer){
        gl.useProgram(this.program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest_framebuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, source_texture);
        gl.uniform1i(this.program_info.uniformLocations.framebuffer_texture, 7);
        gl.uniform2fv(this.program_info.uniformLocations.screen_dimensions, [gl.canvas.width, gl.canvas.height]);
        this.setPositionAttribute(gl,this.program_info,this.position_buffer)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

class BinaryFilter extends PostProcessingFilter{
    constructor(gl,name){
        super(gl,name)
    }

    applyFilter(gl,source_texture1,source_texture2,dest_framebuffer){
        gl.useProgram(this.program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest_framebuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, source_texture1);
        gl.uniform1i(this.program_info.uniformLocations.framebuffer_texture1, 6);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, source_texture2);
        gl.uniform1i(this.program_info.uniformLocations.framebuffer_texture2, 7);
        gl.uniform2fv(this.program_info.uniformLocations.screen_dimensions, [gl.canvas.width, gl.canvas.height]);
        this.setPositionAttribute(gl,this.program_info,this.position_buffer)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}


class ColourFilter extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getColourFilter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
        this.colour = [0,0,0]
    }

    getColourFilter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/colour_shader.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
                part_colour: gl.getUniformLocation(program, "uPartColour"),
            },
        };
        return {program: program, program_info: program_info};
    }

    setColour(gl,colour){
        this.colour = colour
        gl.useProgram(this.program)
        gl.uniform3fv(this.program_info.uniformLocations.part_colour, this.colour);
    }
}

class AffineFilter extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getAffineFilter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
        this.scale_vector = [1,1,1,1];
        this.shift_vector = [0,0,0,0];
    }

    getAffineFilter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/affine_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
                scale_vector: gl.getUniformLocation(program, "uScaleVector"),
                shift_vector: gl.getUniformLocation(program, "uShiftVector"),
            },
        };
        return {program: program, program_info: program_info};
    }
    setAffineTransform(gl,scale_vector = [1,1,1,1],shift_vector = [0,0,0,0]){
        this.scale_vector = scale_vector
        this.shift_vector = shift_vector
        gl.useProgram(this.program)
        gl.uniform4fv(this.program_info.uniformLocations.scale_vector,scale_vector);
        gl.uniform4fv(this.program_info.uniformLocations.shift_vector,shift_vector);
    }
}

class TransformFilter extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getTransformFilter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
        this.selection_vector = [1.0,0.0,0.0,0.0]
        this.out_vector = [0.0,0.0,0.0,1.0]
    }

    getTransformFilter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/transform_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
                selection_vector: gl.getUniformLocation(program, "uSelectionVector"),
                out_vector: gl.getUniformLocation(program, "uOutVector"),
            },
        };
        return {program: program, program_info: program_info};
    }

    setTransform(gl,selection_vector,out_vector){
        this.selection_vector = selection_vector
        this.out_vector = out_vector
        gl.useProgram(this.program)
        gl.uniform4fv(this.program_info.uniformLocations.selection_vector,selection_vector)
        gl.uniform4fv(this.program_info.uniformLocations.out_vector,out_vector)
    }
}

class Gaussian3 extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getGaussian3Filter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getGaussian3Filter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/gaussian3_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}

class Gaussian5 extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getGaussian5Filter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getGaussian5Filter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/gaussian5_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}

class Paint4 extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getPaint4Filter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getPaint4Filter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/paint4_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}

class Paint8 extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getPaint4Filter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getPaint4Filter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/paint8_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}

class Dither extends UnitaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getDitherFilter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getDitherFilter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/dither_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture: gl.getUniformLocation(program, "uFbTexture"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}

class MaximumFilter extends BinaryFilter{

    constructor(gl,name){
        super(gl,name)
        const shader = this.getMaximumFilter(gl)
        this.program = shader.program
        this.program_info = shader.program_info
    }

    getMaximumFilter(gl){
        const program = initShaderProgram(gl, '../resources/general_shaders/screenSpaceShader.vert', '../resources/general_shaders/maximum_filter.frag');
        const program_info = {
            program: program,
            attribLocations: {
                vertex_position: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                framebuffer_texture1: gl.getUniformLocation(program, "uFbTexture1"),
                framebuffer_texture2: gl.getUniformLocation(program, "uFbTexture2"),
                screen_dimensions: gl.getUniformLocation(program, "uScreenDimensions"),
            },
        };
        return {program: program, program_info: program_info};
    }
}
export {getPostProcessingFilter,createScreenFramebuffer}
