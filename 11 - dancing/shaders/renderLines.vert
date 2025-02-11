//display data on canvas

precision mediump float;

attribute vec3 aIndexData;
uniform sampler2D uDataSampler;
uniform sampler2D uFreqSampler;

uniform float uLogFlag;
varying float vVal;

float f(float x){
	float c = 100.0;
	//return log2(c*x + 1.0)/log2(c + 1.0);
	return (pow(c+1.0,x)-1.0)/c;
}

void main() {
	vec4 pointData = texture2D(uDataSampler, aIndexData.xy);
	float freqIndex = aIndexData.z;
	if (uLogFlag > 0.0){
		vVal = texture2D(uFreqSampler, vec2(f(freqIndex),0.5)).x;
		vVal = (freqIndex*0.4+0.8)*vVal*vVal;
		gl_Position = vec4(pointData.xy,0.0,1.0);
		return;
	}
	vVal = texture2D(uFreqSampler, vec2(0.7*freqIndex,0.5)).x;
	gl_Position = vec4(pointData.xy,0.0,1.0);
}