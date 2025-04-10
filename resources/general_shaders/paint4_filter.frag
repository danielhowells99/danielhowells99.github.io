//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
varying vec2 vTexPosition;

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

	float x_i = texture2D(uFbTexture,centre).w;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(1.0,0.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(2.0,0.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(3.0,0.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(4.0,0.0)).x;
	state = updateMeanAndSd(x_i,state);

	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(1.0,1.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(2.0,1.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(3.0,1.0)).x;
	state = updateMeanAndSd(x_i,state);

	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(2.0,2.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(3.0,2.0)).x;
	state = updateMeanAndSd(x_i,state);

	return vec2(state.x,state.y);
}

vec2 wedge2(vec2 centre,vec2 coordIncrement,vec2 flips){ //pi/4 - pi/2
	float mean = 0.0;
	float sd = 0.0;
	float n = 0.0;
	vec3 state = vec3(mean,sd,n);

	float x_i = texture2D(uFbTexture,centre).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(0.0,1.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(0.0,2.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(0.0,3.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(0.0,4.0)).x;
	state = updateMeanAndSd(x_i,state);

	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(1.0,1.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(1.0,2.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(1.0,3.0)).x;
	state = updateMeanAndSd(x_i,state);

	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(2.0,2.0)).x;
	state = updateMeanAndSd(x_i,state);
	x_i = texture2D(uFbTexture,centre + flips*coordIncrement*vec2(2.0,3.0)).x;
	state = updateMeanAndSd(x_i,state);

	return vec2(state.x,state.y);
}


void main() {

	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;

	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
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
	
	gl_FragColor = vec4(vec3(outMag),1.0);
}