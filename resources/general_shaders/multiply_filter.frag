//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture1;
uniform sampler2D uFbTexture2;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	vec4 val = texture2D(uFbTexture1,accessCoords)*texture2D(uFbTexture2,accessCoords);
	gl_FragColor = val;
}