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
const float A4 = 8.0;
const float A5 = 2.0;

const float A6 = 1.0;
const float A7 = 2.0;
const float A8 = 1.0;

const float paintConst = 1.0;
const float normConst = paintConst*1.0/(A0 + A1 + A2 + A3 + A4 + A5 + A6 + A7 + A8);


void main() {

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
	for (float i = -2.0; i <= 2.0;i++){
		for (float j = -2.0; j <= 2.0;j++){
			outCol += 0.03*abs(i*j)*texture2D(uFbTexture,accessCoords + vec2(i*xInc,j*yInc)).w;
		}
	}*/
	
	

	gl_FragColor = vec4(outCol*uPartColor,outCol);
	//gl_FragColor = outCol;
	
}