//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;

const float KERNEL_RADIUS = 16.0;
const float CIRCLE_BOUND = 1.4142*KERNEL_RADIUS/2.0;

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


vec2 wedge1(vec2 centre,vec2 coordIncrement,vec2 flips){ //0 - 2pi/8
	float mean = 0.0;
	float sd = 0.0;
	float n = 0.0;
	vec3 state = vec3(mean,sd,n);
	float x_i = 0.0;
	coordIncrement = flips*coordIncrement;

	for (float y = 0.0;y < CIRCLE_BOUND;y++){
		for (float x = 0.0; x < KERNEL_RADIUS;x++){
				if ((x == 0.0 && y==0.0) || (x < y) || (x > sqrt(KERNEL_RADIUS*KERNEL_RADIUS-y*y))){
					continue;
				}
				x_i = texture2D(uFbTexture,centre + coordIncrement*vec2(x,y)).w;
				state = updateMeanAndSd(x_i,state);
		}
	}
	return vec2(state.x,state.y/state.z);
}

vec2 wedge2(vec2 centre,vec2 coordIncrement,vec2 flips){ //0 - 2pi/8
	float mean = 0.0;
	float sd = 0.0;
	float n = 0.0;
	vec3 state = vec3(mean,sd,n);
	float x_i = 0.0;
	coordIncrement = flips*coordIncrement;

	for (float y = 0.0;y < KERNEL_RADIUS;y++){
		for (float x = 0.0; x < CIRCLE_BOUND;x++){
				if ((x == 0.0 && y==0.0) || (x < y) || (x > sqrt(KERNEL_RADIUS*KERNEL_RADIUS-y*y))){
					continue;
				}
				x_i = texture2D(uFbTexture,centre + coordIncrement*vec2(y,x)).w;
				state = updateMeanAndSd(x_i,state);
		}
	}
	return vec2(state.x,state.y/state.z);
}


void main() {

	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;

	vec2 accessCoords = vTexPosition + 0.5/uScreenDimensions;
	
	float s = 0.0;
	float outMag = 0.0;
	
	
	vec2 w1 = wedge1(accessCoords,vec2(xInc,yInc),vec2(1.0,1.0));
	vec2 w2 = wedge2(accessCoords,vec2(xInc,yInc),vec2(1.0,1.0));
	vec2 w3 = wedge2(accessCoords,vec2(xInc,yInc),vec2(-1.0,1.0));
	vec2 w4 = wedge1(accessCoords,vec2(xInc,yInc),vec2(-1.0,1.0));

	vec2 w5 = wedge1(accessCoords,vec2(xInc,yInc),vec2(1.0,-1.0));
	vec2 w6 = wedge2(accessCoords,vec2(xInc,yInc),vec2(1.0,-1.0));
	vec2 w7 = wedge2(accessCoords,vec2(xInc,yInc),vec2(-1.0,-1.0));
	vec2 w8 = wedge1(accessCoords,vec2(xInc,yInc),vec2(-1.0,-1.0));
	

	vec4 stdvec1 = vec4(w1.y,w2.y,w3.y,w4.y);
	vec4 softmaxvals1 = exp(5.0/(0.1+stdvec1)); 

	vec4 stdvec2 = vec4(w5.y,w6.y,w7.y,w8.y);
	vec4 softmaxvals2 = exp(5.0/(0.1+stdvec2));


	float normConst = softmaxvals1.x+softmaxvals1.y+softmaxvals1.z+softmaxvals1.w + softmaxvals2.x+softmaxvals2.y+softmaxvals2.z+softmaxvals2.w;
	outMag = (dot(softmaxvals1,vec4(w1.x,w2.x,w3.x,w4.x)) + dot(softmaxvals2,vec4(w5.x,w6.x,w7.x,w8.x)))/normConst;
	
	//quantize
	
	s = outMag;
	/*
	float quantFactor = 12.0;
	s = (1.0/quantFactor)*floor(quantFactor*s + 0.5);
	*/
	//vec3 finalOutCol = hsv2rgb(vec3(0.55-0.3*s,1.0-0.95*s,0.07+1.0*s));
	//vec3 finalOutCol = hsv2rgb(vec3(-0.3+0.6*s,0.85-0.70*s,0.07+1.0*s));
	vec3 finalOutCol = hsv2rgb(vec3(0.9+0.1*s,1.0-0.8*s*s,0.07+0.92*s));
	//vec3 finalOutCol = 0.5+0.5*sin(6.28*(vec3(1.0,1.0,1.0)*s + vec3(0.0,1.0,2.0)));
	
	gl_FragColor = vec4(finalOutCol,1.0);// + 0.5*vec4(vec3(texture2D(uFbTexture,accessCoords).w),1.0);
	//gl_FragColor = vec4(0.5+0.5*sin(300.0*vTexPosition.x),0.0,0.0,1.0);
}