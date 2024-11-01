//display data on canvas
attribute vec2 aVertexPosition;
attribute vec2 aTexPosition;
uniform mat2 uRotMatrix;
uniform float uAspect;
varying vec2 vTexPosition;

void main() {
	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/uAspect);
	}
	gl_Position = vec4(0.99*(uRotMatrix*aVertexPosition)/transformVector,0.0,1.0);
	vTexPosition = aTexPosition;
}