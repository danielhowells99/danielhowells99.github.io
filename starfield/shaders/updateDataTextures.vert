#version 300 es
precision highp float;
//manage data stored in textures
//general use vertex shader used for both position and velocity updates

in vec4 aVertexPosition;
out vec2 vTexturePosition;

void main() {
	gl_Position = aVertexPosition;
	vTexturePosition = 0.5*aVertexPosition.xy+0.5;
}