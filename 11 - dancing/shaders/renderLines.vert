//display data on canvas
attribute vec3 aIndexData;
uniform sampler2D uDataSampler;
uniform sampler2D uFreqSampler;

varying float vVal;

void main() {
	vec4 pointData = texture2D(uDataSampler, aIndexData.xy);
	vVal = texture2D(uFreqSampler, vec2(aIndexData.z,0.5)).x;
	gl_Position = vec4(pointData.xy,0.0,1.0);
}