//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture1;
uniform sampler2D uFbTexture2;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	float val = max(texture2D(uFbTexture1,accessCoords).x,texture2D(uFbTexture2,accessCoords).x);
	gl_FragColor = vec4(val,val,val,1.0);
}