//display data on canvas

precision mediump float;

attribute vec3 aIndexData;
uniform sampler2D uDataSampler;
uniform sampler2D uFreqSampler;

uniform float uLogFlag;
uniform float uFreqStat;
varying float vVal;

float f(float x){
	float c = 100.0;
	//return log2(c*x + 1.0)/log2(c + 1.0);
	return (pow(c+1.0,x)-1.0)/c;
}

float g(float val,float index){
	float gain = pow(index,0.4);
	float compress = log(1.0+1.4*val);
	return 4.0*gain*compress;
}

float h(float val,float index){
	return 2.5*val;
}

void main() {
	vec4 pointData = texture2D(uDataSampler, aIndexData.xy);
	float freqIndex = aIndexData.z;
	
	if (uLogFlag > 0.0){
		vVal = texture2D(uFreqSampler, vec2(freqIndex,0.5)).x;
		//vVal = ((0.3 + exp(freqIndex)))*vVal;
		vVal = g(vVal,freqIndex);
		//vVal = h(vVal,freqIndex);
		gl_Position = vec4(pointData.xy,0.0,1.0);
		return;
	}
	vVal = texture2D(uFreqSampler, vec2(freqIndex,0.5)).x;
	gl_Position = vec4(pointData.xy,0.0,1.0);
} 