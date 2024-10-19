//display data on canvas

precision mediump float;

uniform float uAspect;
varying vec2 vVelocity;

void main() {
	/*
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	if (dot(circCoord, circCoord) > 1.0) {
		discard;
	}
	*/
	gl_FragColor = vec4(1.0,1.0,1.0,0.15);
}