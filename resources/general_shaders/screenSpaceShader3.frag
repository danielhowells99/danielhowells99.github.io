//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

const float DITHER_SIZE = 8.0;
const float NORMALIZE = DITHER_SIZE*DITHER_SIZE + 1.0;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float getThreshold1(vec2 pixelPos){
	int index = int(pixelPos.x + DITHER_SIZE*pixelPos.y);
	if (index == 0) return 1.0/NORMALIZE;
	if (index == 1) return 13.0/NORMALIZE;
	if (index == 2) return 3.0/NORMALIZE;
	if (index == 3) return 15.0/NORMALIZE;
	if (index == 4) return 9.0/NORMALIZE;
	if (index == 5) return 5.0/NORMALIZE;
	if (index == 6) return 11.0/NORMALIZE;
	if (index == 7) return 7.0/NORMALIZE;
	if (index == 8) return 4.0/NORMALIZE;
	if (index == 9) return 16.0/NORMALIZE;
	if (index == 10) return 2.0/NORMALIZE;
	if (index == 11) return 14.0/NORMALIZE;
	if (index == 12) return 12.0/NORMALIZE;
	if (index == 13) return 8.0/NORMALIZE;
	if (index == 14) return 10.0/NORMALIZE;
	if (index == 15) return 6.0/NORMALIZE;
	return 0.0;
}

float getThreshold2(vec2 pixelPos){
	int index = int(pixelPos.x + DITHER_SIZE*pixelPos.y);
	return float(index)/NORMALIZE;
}

float getThreshold(vec2 pixelPos){
	vec2 centered = (2.0*pixelPos/(DITHER_SIZE-1.0)-1.0);
	float mag = 0.1 + 0.9*length(centered);
	return mag;
}

void main() {

	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;
	
	float s = 0.0;
	float outMag = 0.0;

	vec2 pixelPos = vTexPosition*uScreenDimensions;
	vec2 cornerCoords = DITHER_SIZE*floor(pixelPos/DITHER_SIZE)/uScreenDimensions;

	float avgVal = 0.0;
	float n = 0.0;
	for (float i = 0.0;i<DITHER_SIZE;i++){
		for (float j = 0.0;j<DITHER_SIZE;j++){
			n += 1.0;
			avgVal += texture2D(uFbTexture,cornerCoords + vec2(i*xInc,j*yInc)).w;
		}
	}
	avgVal /= n;

	pixelPos = mod(pixelPos,DITHER_SIZE);
	if (avgVal > getThreshold(pixelPos)){
		s = 1.0;
	}
	/*
	float quantFactor = 32.0;
	s = (1.0/quantFactor)*floor(quantFactor*s + 0.5);
	*/
	
	vec3 finalOutCol = vec3(s);
	gl_FragColor = vec4(finalOutCol,1.0);
}