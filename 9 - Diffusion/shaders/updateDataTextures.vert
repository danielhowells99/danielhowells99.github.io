precision highp float;
//manage data stored in textures
//renders positional and velocity data to texture bound to framebuffer

attribute vec4 aVertexPosition;
varying vec2 vTexturePosition;

void main() {
	gl_Position = aVertexPosition;
	vTexturePosition = aVertexPosition.xy;
}