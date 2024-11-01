//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;
	gl_FragColor = vec4(texture2D(uFbTexture,accessCoords).xyz,1.0);
	
}