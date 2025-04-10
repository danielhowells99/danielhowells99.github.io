//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;

uniform vec4 uSelectionVector;
uniform vec4 uOutVector;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;	
	float val = dot(texture2D(uFbTexture,accessCoords),uSelectionVector);
	gl_FragColor = val*uOutVector;
}