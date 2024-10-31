//display data on canvas

precision mediump float;
uniform sampler2D uDataSampler;
varying vec2 vTexPosition;

float f(float x){
	float c = 12.0;
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
	//vec2 accessCoords = vec2(f(vTexPosition.x),vTexPosition.y);
	vec2 accessCoords = vec2(vTexPosition.x,vTexPosition.y);
	float freqVal = texture2D(uDataSampler,accessCoords).x;
	float freqVal2 = texture2D(uDataSampler,1.0-accessCoords).x;
	float s = clamp(pow(0.6*(freqVal + freqVal2),1.5),0.0,1.0);
	//gl_FragColor = vec4(freqVal,pow(0.5*(freqVal + freqVal2),1.3),freqVal2,1.0); //
	//gl_FragColor = vec4(freqVal,pow(0.5*(freqVal + freqVal2),1.3),freqVal2,1.0); //
	gl_FragColor = vec4(hsv2rgb(vec3(1.0-1.0*s,1.0-0.75*s,1.0*s)),1.0); //
	//gl_FragColor = vec4(vec3(pow(freqVal,2.0)),1.0); //
}