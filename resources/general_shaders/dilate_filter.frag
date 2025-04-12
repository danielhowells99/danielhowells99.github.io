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
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;

	vec3 central_colour = texture2D(uFbTexture,accessCoords).xyz;
	float central_luminance = getLuminance(central_colour);

	vec3 up_colour = texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).xyz;
	float up_luminance = getLuminance(up_colour);

	vec3 down_colour = texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).xyz;
	float down_luminance = getLuminance(down_colour);

	vec3 left_colour = texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).xyz;
	float left_luminance = getLuminance(left_colour);

	vec3 right_colour = texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).xyz;
	float right_luminance = getLuminance(right_colour);

	vec3 outCol = central_colour;
	float maxLum = central_luminance;
	
	if (up_luminance > maxLum){
		outCol = up_colour;
		maxLum = up_luminance;
	}
	if (down_luminance > maxLum){
		outCol = down_colour;
		maxLum = down_luminance;
	}
	if (left_luminance > maxLum){
		outCol = left_colour;
		maxLum = left_luminance;
	}
	if (right_luminance > maxLum){
		outCol = right_colour;
		maxLum = right_luminance;
	}
	
	gl_FragColor = vec4(outCol,1.0);
}