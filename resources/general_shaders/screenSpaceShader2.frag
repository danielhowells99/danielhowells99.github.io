//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

const float KERNEL_RADIUS = 8.0;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 kernel(vec2 quadrant,vec2 centre,vec2 coordIncrement){
	float mean = 0.0;
	float prev_mean = 0.0;
	float sd = 0.0;
	float n = 0.0;
	const float m = KERNEL_RADIUS/2.0;
	for (float i=-m;i<=m;i++){
		for (float j=-m;j<=m;j++){
			//float x_i = 0.5+0.5*sin(300.0*vTexPosition.x);//texture2D(uFbTexture,centre+m*quadrant+coordIncrement*vec2(i,j)).w;
			float x_i = texture2D(uFbTexture,centre+m*quadrant+coordIncrement*vec2(i,j)).w;
			n = n + 1.0;
			prev_mean = mean;
			mean = mean + (x_i - mean) / n;
			sd = sd + (x_i - mean) * (x_i - prev_mean);
		}
	}
	sd = sd/n;
	float weight = sd;
	return vec2(mean,weight);
}


void main() {
	vec2 accessCoords = vTexPosition + 0.5/uScreenDimensions;
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;
	
	float s = 0.0;
	float outMag = 0.0;
	
	
	vec2 quadrant1 = kernel(vec2(-xInc,-yInc),accessCoords,vec2(xInc,yInc));
	vec2 quadrant2 = kernel(vec2(xInc,-yInc),accessCoords,vec2(xInc,yInc));
	vec2 quadrant3 = kernel(vec2(xInc,yInc),accessCoords,vec2(xInc,yInc));
	vec2 quadrant4 = kernel(vec2(-xInc,yInc),accessCoords,vec2(xInc,yInc));
	
	vec4 stdvec = vec4(quadrant1.y,quadrant2.y,quadrant3.y,quadrant4.y);
	
	vec4 softmaxvals = exp(5.0/(0.1+stdvec));
	float normConst = softmaxvals.x+softmaxvals.y+softmaxvals.z+softmaxvals.w;
	outMag = dot(softmaxvals,vec4(quadrant1.x,quadrant2.x,quadrant3.x,quadrant4.x))/normConst;
	
	
	/*
	//float minStd = max(stdvec.x,max(stdvec.y,max(stdvec.z,stdvec.w)));
	float minStd = min(stdvec.x,min(stdvec.y,min(stdvec.z,stdvec.w)));
	if (minStd == stdvec.x){
		outMag = quadrant1.x;
	}
	if (minStd == stdvec.y){
		outMag = quadrant2.x;
	}
	if (minStd == stdvec.z){
		outMag = quadrant3.x;
	}
	if (minStd == stdvec.w){
		outMag = quadrant4.x;
	}
	*/
	
	//quantize
	
	s = outMag;
	
	float quantFactor = 32.0;
	s = (1.0/quantFactor)*floor(quantFactor*s + 0.5);
	
	//vec3 finalOutCol = hsv2rgb(vec3(0.55-0.3*s,1.0-0.95*s,0.07+1.0*s));
	//vec3 finalOutCol = hsv2rgb(vec3(-0.3+0.6*s,0.85-0.70*s,0.07+1.0*s));
	vec3 finalOutCol = hsv2rgb(vec3(0.9+0.1*s,1.0-0.8*s*s,0.07+0.92*s));
	//vec3 finalOutCol = vec3(s);
	
	gl_FragColor = vec4(finalOutCol,1.0);// + 0.5*vec4(vec3(texture2D(uFbTexture,accessCoords).w),1.0);
	//gl_FragColor = vec4(0.5+0.5*sin(300.0*vTexPosition.x),0.0,0.0,1.0);
}