//display data on canvas

precision mediump float;
uniform sampler2D uDataSampler;
varying vec2 vTexPosition;

void main() {
	float freqVal = texture2D(uDataSampler,vTexPosition).x;
	float freqVal2 = texture2D(uDataSampler,vec2(1.0-vTexPosition.x,vTexPosition.y)).x;
	gl_FragColor = vec4(freqVal,0.5*(freqVal + freqVal2),freqVal2,1.0); //
}