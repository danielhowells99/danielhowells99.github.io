//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform float uShiftVal;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition+vec2(uShiftVal,0.0);
	if (accessCoords.x >= 1.0){
		discard;
	}
	
	gl_FragColor = texture2D(uFbTexture,accessCoords);
	
}