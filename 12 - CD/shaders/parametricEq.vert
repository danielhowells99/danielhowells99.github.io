//display data on canvas
attribute vec2 aVertexPosition;
varying vec2 vVertexPosition;

void main() {
	vVertexPosition = 0.5*aVertexPosition + 0.5;
	gl_Position = vec4(aVertexPosition,0.0,1.0);	
}