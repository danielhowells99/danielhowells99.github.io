//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture1;
uniform sampler2D uFbTexture2;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	vec3 val = max(texture2D(uFbTexture1,accessCoords).xyz,texture2D(uFbTexture2,accessCoords).xyz);
	gl_FragColor = vec4(val,1.0);
}