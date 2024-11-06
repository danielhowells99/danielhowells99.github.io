//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
varying vec2 vTexPosition;

void main() {
	gl_FragColor = texture2D(uFbTexture,vTexPosition);
	
}