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

//-------------------
const float B00 = 1.0;
const float B01 = 2.0;
const float B02 = 4.0;
const float B03 = 2.0;
const float B04 = 1.0;

const float B10 = 2.0;
const float B11 = 4.0;
const float B12 = 8.0;
const float B13 = 4.0;
const float B14 = 2.0;

const float B20 = 4.0;
const float B21 = 8.0;
const float B22 = 16.0;
const float B23 = 8.0;
const float B24 = 4.0;

const float B30 = 2.0;
const float B31 = 4.0;
const float B32 = 8.0;
const float B33 = 4.0;
const float B34 = 2.0;

const float B40 = 1.0;
const float B41 = 2.0;
const float B42 = 4.0;
const float B43 = 2.0;
const float B44 = 1.0;
//-------------------

//const float paintConst = 1.0;
const float paintConst = 1.0;//(1.0/0.75);
const float normConst = 1.0/(A0 + A1 + A2 + A3 + A4 + A5 + A6 + A7 + A8);
const float norm2 = 1.0/((B00+B01+B02+B03+B04)+(B10+B11+B12+B13+B14)+(B20+B21+B22+B23+B24)+(B30+B31+B32+B33+B34)+(B40+B41+B42+B43+B44));

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	//vec2 distortVec = 100.0*vec2(sin(10.0*vTexPosition.x - 13.0*vTexPosition.y)*cos(20.0*vTexPosition.y*vTexPosition.y),sin(10.0*vTexPosition.x*vTexPosition.y)*cos(20.0*vTexPosition.x+10.0*vTexPosition.y));
	//vec2 accessCoords = clamp(vTexPosition + distortVec/uScreenDimensions,0.0,1.0);// + 0.5/uScreenDimensions;
	vec2 accessCoords = vTexPosition + 0.5/uScreenDimensions;
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
	/*
	outCol += normConst*A0*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += normConst*A1*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += normConst*A2*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	
	outCol += normConst*A3*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += normConst*A4*centerCol.w;
	outCol += normConst*A5*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	
	outCol += normConst*A6*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += normConst*A7*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += normConst*A8*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	*/
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
	
	outCol += norm2*B00*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,-2.0*yInc)).w; 
	outCol += norm2*B01*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,-2.0*yInc)).w; 
	outCol += norm2*B02*texture2D(uFbTexture,accessCoords + vec2(0.0,-2.0*yInc)).w; 
	outCol += norm2*B03*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,-2.0*yInc)).w; 
	outCol += norm2*B04*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,-2.0*yInc)).w; 
	
	outCol += norm2*B10*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,-1.0*yInc)).w; 
	outCol += norm2*B11*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,-1.0*yInc)).w; 
	outCol += norm2*B12*texture2D(uFbTexture,accessCoords + vec2(0.0,-1.0*yInc)).w; 
	outCol += norm2*B13*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,-1.0*yInc)).w; 
	outCol += norm2*B14*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,-1.0*yInc)).w; 
	
	outCol += norm2*B20*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,0.0)).w; 
	outCol += norm2*B21*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,0.0)).w; 
	outCol += norm2*B22*centerCol.w;
	outCol += norm2*B23*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,0.0)).w; 
	outCol += norm2*B24*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,0.0)).w; 
	
	outCol += norm2*B30*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,1.0*yInc)).w; 
	outCol += norm2*B31*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,1.0*yInc)).w; 
	outCol += norm2*B32*texture2D(uFbTexture,accessCoords + vec2(0.0,1.0*yInc)).w; 
	outCol += norm2*B33*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,1.0*yInc)).w; 
	outCol += norm2*B34*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,1.0*yInc)).w; 
	
	outCol += norm2*B40*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,2.0*yInc)).w; 
	outCol += norm2*B41*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,2.0*yInc)).w; 
	outCol += norm2*B42*texture2D(uFbTexture,accessCoords + vec2(0.0,2.0*yInc)).w; 
	outCol += norm2*B43*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,2.0*yInc)).w; 
	outCol += norm2*B44*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,2.0*yInc)).w; 

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
	//gl_FragColor = vec4(min(vec3(0.75,0.9,1.0)*s,vec3(1.0)),outCol); //GALAXY BLUE (adjust paint const accordingly 1.0/0.75)
	//gl_FragColor = vec4(min(vec3(0.4,0.1,0.1)*(0.15 + s),vec3(1.0)),outCol); //GALAXY BLUE (adjust paint const accordingly 1.0/0.75)
	//gl_FragColor = vec4(vec3(0.04,0.005,0.14),outCol);
	
	//gl_FragColor = vec4(hsv2rgb(vec3(1.0-s,1.0-s,s)),1.0);
	//gl_FragColor = vec4(hsv2rgb(vec3(0.8-0.3*s,1.0-0.9*s,1.0*s)),1.0);//biolumin
	//gl_FragColor = vec4(hsv2rgb(vec3(0.6-0.3*s,1.0-0.9*s,1.0*s)),1.0);//occil
	
	//gl_FragColor = vec4(hsv2rgb(vec3(0.5-0.2*s,1.0-s,1.0*s)),1.0);//greeeeen
	//gl_FragColor = vec4(hsv2rgb(vec3(0.2+0.2*s,1.0-s*s,1.0*s)),1.0);//greeeeen
	
	vec3 col1 = vec3(0.0,0.06,0.05);
	vec3 col2 = hsv2rgb(vec3(0.4+0.2*s,1.0-s,1.0));
	
	gl_FragColor = vec4((1.0-s)*col1 + s*col2,1.0);
	
	//gl_FragColor = vec4(hsv2rgb(vec3(-0.5+0.85*s,1.0-0.9*s,1.0*s)),1.0);
	//gl_FragColor = vec4(s,s,s,1.0);
	//gl_FragColor = vec4(hsv2rgb(vec3(1.0-s,1.0,1.0*s)),1.0);
	//gl_FragColor = vec4(hsv2rgb(vec3(0.05,1.0-0.9*s,0.1+0.9*s)),1.0);
}