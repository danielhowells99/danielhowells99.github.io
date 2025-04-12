//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
varying vec2 vTexPosition;

float getLuminance(vec3 colour){
	return dot(colour,vec3(77.0,151.0,28.0)/256.0);
}

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	vec3 central_colour = texture2D(uFbTexture,accessCoords).xyz;
	float central_luminance = getLuminance(central_colour);
	gl_FragColor = vec4(vec3(central_luminance),1.0);
}