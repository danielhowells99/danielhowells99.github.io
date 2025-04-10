//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
uniform vec4 uScaleVector;
uniform vec4 uShiftVector;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;	
	gl_FragColor = texture2D(uFbTexture,accessCoords)*uScaleVector - uShiftVector;
}