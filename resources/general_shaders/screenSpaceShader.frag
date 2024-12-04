//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
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

/*
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

const float norm2 = 1.0/((B00+B01+B02+B03+B04)+(B10+B11+B12+B13+B14)+(B20+B21+B22+B23+B24)+(B30+B31+B32+B33+B34)+(B40+B41+B42+B43+B44));
//-------------------*/

const float paintConst = 1.0;
const float normConst = 1.0/(A0 + A1 + A2 + A3 + A4 + A5 + A6 + A7 + A8);


vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;
	
	
	float outCol = 0.0;

	//outCol += texture2D(uFbTexture,accessCoords).w;

	
	outCol += normConst*A0*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).w; 
	outCol += normConst*A1*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).w;
	outCol += normConst*A2*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).w;
	
	outCol += normConst*A3*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).w;
	outCol += normConst*A4*texture2D(uFbTexture,accessCoords).w;
	outCol += normConst*A5*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).w;
	
	outCol += normConst*A6*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).w;
	outCol += normConst*A7*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).w;
	outCol += normConst*A8*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).w;
	
	/*
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
	outCol += norm2*B22*texture2D(uFbTexture,accessCoords).w;
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
	*/
	
	float s = paintConst*outCol; //(paint => 1.0/min(rgb))

	//quantize
	//float quantFactor = 5.0;
	//s = (1.0/quantFactor)*floor(quantFactor*s + 0.5);

	//desktop green
	
	vec3 finalOutCol = hsv2rgb(vec3(166.0/360.0,.640,.295)); //bgCol
	if (s > 0.0){
		finalOutCol = hsv2rgb(vec3(166.0/360.0,(1.0-s),.295 + 0.705*s));
	}
	
	//ALT 1.0
	//vec3 finalOutCol = hsv2rgb(vec3(166.0/360.0,(1.0-s),0.1+0.9*s));

	//negative contrast
	//vec3 finalOutCol = hsv2rgb(vec3(1.1-0.4*s,0.1 + 0.5*s,1.0-s)); 

	//blk & wht
	//vec3 finalOutCol  = vec3(s);

	//rainbow
	//s += 0.3;
	//vec3 finalOutCol  = hsv2rgb(vec3(clamp(s,0.0,1.2),0.38 - 0.23*sin(6.283*s),0.65 + 0.25*sin(6.283*s)));

	//copper
	//s *= 3.14;
	//vec3 finalOutCol = 0.5 + 0.5*vec3(sin(-s + 0.2),sin(-s + 0.4),sin(-s + 0.6));

	//RED
	//vec3 finalOutCol = hsv2rgb(vec3(0.0,1.0-0.9*s*s,0.07+s));

	//Blue
	//vec3 finalOutCol = hsv2rgb(vec3(0.7-0.3*s,1.0-0.9*s,0.07+1.0*s));

	//green
	//vec3 finalOutCol = hsv2rgb(vec3(0.55-0.3*s,1.0-0.95*s,0.07+1.0*s));

	//temp temp
	//vec3 finalOutCol = hsv2rgb(vec3(1.0-s,1.0,s));	

	//saturated rainbow
	//vec3 finalOutCol = hsv2rgb(vec3(s,1.0,1.0));

	//convex
	/*
	vec3 col1 = vec3(0.04,0.005,0.14);
	vec3 col2 = vec3(0.98, 0.90, 0.82);
	vec3 finalOutCol = s*col1 + (1.0-s)*col2;
	*/

	
	gl_FragColor = vec4(finalOutCol,1.0);

	//pass through
	//gl_FragColor = vec4(texture2D(uFbTexture,accessCoords).xyz,1.0);
	
}