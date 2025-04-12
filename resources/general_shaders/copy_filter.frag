//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;	
	gl_FragColor = texture2D(uFbTexture,accessCoords);
}