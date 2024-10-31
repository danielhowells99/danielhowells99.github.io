//display data on canvas
attribute vec2 aVertexPosition;
varying vec2 vTexPosition;

void main() {
	gl_Position = vec4(aVertexPosition,0.0,1.0);
	vTexPosition = 0.5+0.5*aVertexPosition;
}