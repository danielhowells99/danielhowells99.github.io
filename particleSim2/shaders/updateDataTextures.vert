precision highp float;
//manage data stored in textures
//general use vertex shader used for both position and velocity updates

attribute vec4 aVertexPosition;
varying vec2 vTexturePosition;

void main() {
	gl_Position = aVertexPosition;
	vTexturePosition = 0.5*aVertexPosition.xy+0.5;
}