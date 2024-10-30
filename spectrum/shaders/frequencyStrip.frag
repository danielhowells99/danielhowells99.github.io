//display data on canvas

precision mediump float;
uniform sampler2D uDataSampler;
varying vec2 vTexPosition;

void main() {
	vec2 accessCoords = fract(vTexPosition);
	//float freqVal = texture2D(uDataSampler,abs(vTexPosition-vec2(0.25,0.0))).x;
	//float freqVal2 = texture2D(uDataSampler,abs(vec2(0.75,0.0)-vTexPosition)).x;
	float freqVal = texture2D(uDataSampler,accessCoords).x;
	float freqVal2 = texture2D(uDataSampler,1.0-accessCoords).x;
	gl_FragColor = vec4(freqVal,pow(0.5*(freqVal + freqVal2),1.3),freqVal2,1.0); //
}