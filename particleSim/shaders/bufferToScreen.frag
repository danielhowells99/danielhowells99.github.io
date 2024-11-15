//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
uniform float uTransparencyTest;
uniform vec3 uPartColor;

varying vec2 vTexPosition;

const float A0 = 1.0;
const float A1 = 2.0;
const float A2 = 1.0;

const float A3 = 2.0;
const float A4 = 4.0;
const float A5 = 2.0;

const float A6 = 1.0;
const float A7 = 2.0;
const float A8 = 1.0;

//const float paintConst = 1.0;
const float paintConst = 0.99*1.0*(1.0/0.75);
const float normConst = 1.0/(A0 + A1 + A2 + A3 + A4 + A5 + A6 + A7 + A8);

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	//vec2 distortVec = 100.0*vec2(sin(10.0*vTexPosition.x - 13.0*vTexPosition.y)*cos(20.0*vTexPosition.y*vTexPosition.y),sin(10.0*vTexPosition.x*vTexPosition.y)*cos(20.0*vTexPosition.x+10.0*vTexPosition.y));
	//vec2 accessCoords = clamp(vTexPosition + distortVec/uScreenDimensions,0.0,1.0);// + 0.5/uScreenDimensions;
	vec2 accessCoords = vTexPosition;
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;
	
	vec4 centerCol = texture2D(uFbTexture,accessCoords); 
	float outCol = 0.0;
	
	/*
	if (centerCol.w < 0.1 && uTransparencyTest > 0.0){
		//outCol = vec4(1.0,0.0,0.0,0.0);
		discard;
	}
	*/
	//outCol = centerCol.w;
	
	outCol += normConst*A0*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += normConst*A1*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += normConst*A2*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	
	outCol += normConst*A3*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += normConst*A4*centerCol.w;
	outCol += normConst*A5*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	
	outCol += normConst*A6*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += normConst*A7*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += normConst*A8*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	
	/*
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += 0.25*centerCol.w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	
	outCol *= 1.01;
	*/
	
	/*
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += 0.27*centerCol.w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += 0.125*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += 0.0625*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	*/
	/*
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += 0.25*centerCol;
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += 0.11*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	*/
	/*
	float adjust = 0.0;
	for (float i = -12.0; i <= 12.0;i++){
		for (float j = -12.0; j <= 12.0;j++){
			float coeff = 1.0/max(length(vec2(i,j)),0.001);
			adjust += coeff;
			outCol += coeff*texture2D(uFbTexture,accessCoords + vec2(i*xInc,j*yInc)).w;
		}
	}
	outCol /= adjust;
	*/
	
	float s = paintConst*outCol; //(paint => 1.0/min(rgb))
	
	//gl_FragColor = vec4(uPartColor,outCol);
	gl_FragColor = vec4(min(vec3(0.75,0.9,1.0)*s,vec3(1.0)),outCol); //GALAXY BLUE (adjust paint const accordingly 1.0/0.75)
	//gl_FragColor = vec4(min(vec3(0.4,0.1,0.1)*(0.15 + s),vec3(1.0)),outCol); //GALAXY BLUE (adjust paint const accordingly 1.0/0.75)
	//gl_FragColor = vec4(vec3(0.04,0.005,0.14),outCol);
	
	//gl_FragColor = vec4(hsv2rgb(vec3(1.0-s,1.0-s,s)),1.0);
	//gl_FragColor = vec4(hsv2rgb(vec3(0.45 + s,1.0-s,s)),1.0);
}