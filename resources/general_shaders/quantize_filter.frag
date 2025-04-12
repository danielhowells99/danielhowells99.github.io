//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
uniform float uQuantizeLevel;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;	
	float s = texture2D(uFbTexture,accessCoords).x;
	
	s = (1.0/uQuantizeLevel)*floor(uQuantizeLevel*s + 0.5);

	gl_FragColor = vec4(vec3(s),1.0);
}