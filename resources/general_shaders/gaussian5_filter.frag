//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;

varying vec2 vTexPosition;


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

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;
	
	float outCol = 0.0;
	
	outCol += B00*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,-2.0*yInc)).x; 
	outCol += B01*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,-2.0*yInc)).x; 
	outCol += B02*texture2D(uFbTexture,accessCoords + vec2(0.0,-2.0*yInc)).x; 
	outCol += B03*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,-2.0*yInc)).x; 
	outCol += B04*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,-2.0*yInc)).x; 
	
	outCol += B10*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,-1.0*yInc)).x; 
	outCol += B11*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,-1.0*yInc)).x; 
	outCol += B12*texture2D(uFbTexture,accessCoords + vec2(0.0,-1.0*yInc)).x; 
	outCol += B13*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,-1.0*yInc)).x; 
	outCol += B14*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,-1.0*yInc)).x; 
	
	outCol += B20*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,0.0)).x; 
	outCol += B21*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,0.0)).x; 
	outCol += B22*texture2D(uFbTexture,accessCoords).x;
	outCol += B23*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,0.0)).x; 
	outCol += B24*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,0.0)).x; 
	
	outCol += B30*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,1.0*yInc)).x; 
	outCol += B31*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,1.0*yInc)).x; 
	outCol += B32*texture2D(uFbTexture,accessCoords + vec2(0.0,1.0*yInc)).x; 
	outCol += B33*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,1.0*yInc)).x; 
	outCol += B34*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,1.0*yInc)).x; 
	
	outCol += B40*texture2D(uFbTexture,accessCoords + vec2(-2.0*xInc,2.0*yInc)).x; 
	outCol += B41*texture2D(uFbTexture,accessCoords + vec2(-1.0*xInc,2.0*yInc)).x; 
	outCol += B42*texture2D(uFbTexture,accessCoords + vec2(0.0,2.0*yInc)).x; 
	outCol += B43*texture2D(uFbTexture,accessCoords + vec2(1.0*xInc,2.0*yInc)).x; 
	outCol += B44*texture2D(uFbTexture,accessCoords + vec2(2.0*xInc,2.0*yInc)).x; 
	
	
	float s = norm2*outCol;
	gl_FragColor = vec4(vec3(s),1.0);
}