//display data on canvas

precision mediump float;

uniform sampler2D uDataSampler;
uniform float uShiftVal;
uniform int uLogSelect;
uniform int uInvertFreq;
uniform vec2 uFreqStat;
uniform int uTransformToggle;

varying vec2 vTexPosition;

const float KERNEL_RADIUS = 1.0;

float f(float x){
	float c = 100.0;
	//return log2(c*x + 1.0)/log2(c + 1.0);
	return (pow(c+1.0,x)-1.0)/c;
}

/*
float f(float x){
	return (1.0/1.51188336098)*log()
}
*/

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 updateMeanAndSd(float x_i,vec3 state){
	state.z = state.z + 1.0;
	float prev_mean = state.x;
	state.x = state.x + (x_i - state.x)/state.z;
	state.y = state.y + (x_i - state.x) * (x_i - prev_mean);
	return state;
}

float transform1(vec2 p){
	vec3 state = vec3(0.0);
	float x_i = 0.0;
	for (float i = -KERNEL_RADIUS;i<=KERNEL_RADIUS;i++){
		x_i = texture2D(uDataSampler,vec2(f(p.x + i/512.0),p.y)).x;
		state = updateMeanAndSd(x_i,state);
	}
	return state.y*state.y*100000.0;
}

float transform2(vec2 p){
	float sum = 0.0;
	for (float i = -KERNEL_RADIUS;i<=KERNEL_RADIUS;i++){
		sum += i*texture2D(uDataSampler,vec2(f(p.x + i/512.0),p.y)).x;
	}
	return 30.0*abs(sum);
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
	
	float freqVal = 0.0;
	if (uTransformToggle > 0){
		freqVal = transform1(vTexPosition.yx);
	} else {
		freqVal = texture2D(uDataSampler,accessCoords).x;
	}

	float s = freqVal;
	vec4 outColour = vec4(0.0);
	if (uLogSelect > 0){
		outColour = vec4(vec3(s*s),1.0);
	} else {
		outColour = vec4(vec3(s),1.0);
	}

	gl_FragColor = outColour;
}