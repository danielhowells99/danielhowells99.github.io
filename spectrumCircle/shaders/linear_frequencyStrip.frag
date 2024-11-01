//display data on canvas

precision mediump float;

uniform sampler2D uDataSampler;
uniform float uShiftVal;
uniform int uLogSelect;
uniform int uInvertFreq;

varying vec2 vTexPosition;

float f(float x){
	float c = 100.0;
	//return log2(c*x + 1.0)/log2(c + 1.0);
	return (pow(c+1.0,x)-1.0)/c;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	
	if (vTexPosition.x <= 1.0 - uShiftVal){
		discard;
	}
	
	vec2 accessCoords = vTexPosition.yx;
	if (uInvertFreq > 0){
		accessCoords.x = 1.0 - accessCoords.x;
	}
	if (uLogSelect > 0){
		accessCoords = vec2(f(accessCoords.x),accessCoords.y);
	}
	
	float freqVal = texture2D(uDataSampler,accessCoords).x;
	float s = freqVal;
	vec4 outColour = vec4(0.0);
	if (uLogSelect > 0){
		outColour = vec4(hsv2rgb(vec3(1.0-1.0*s*s,1.0-1.0*s*s,1.4*s*s)),1.0); //
	} else {
		outColour = vec4(hsv2rgb(vec3(1.0-1.0*s,1.0-1.0*s,1.5*s)).xyz,1.0); //
	}

	gl_FragColor = outColour;
}