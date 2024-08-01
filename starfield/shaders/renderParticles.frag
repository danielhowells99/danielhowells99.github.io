//display data on canvas

precision mediump float;

uniform float uAspect;
uniform float uParticleNumSqd;

varying vec2 vTexturePosition;

void main() {
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	if (dot(circCoord, circCoord) > 1.0) {
		discard;
	}
	gl_FragColor = vec4(1.0,0.98,0.95,1.0);
}