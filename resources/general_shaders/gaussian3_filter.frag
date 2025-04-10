//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
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

const float normConst = 1.0/(A0 + A1 + A2 + A3 + A4 + A5 + A6 + A7 + A8);

void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;
	float xInc = 1.0/uScreenDimensions.x;
	float yInc = 1.0/uScreenDimensions.y;

	float val = 0.0;
	val += A0*texture2D(uFbTexture,accessCoords + vec2(-xInc,-yInc)).x; 
	val += A1*texture2D(uFbTexture,accessCoords + vec2(0.0,-yInc)).x;
	val += A2*texture2D(uFbTexture,accessCoords + vec2(xInc,-yInc)).x;
	
	val += A3*texture2D(uFbTexture,accessCoords + vec2(-xInc,0.0)).x;
	val += A4*texture2D(uFbTexture,accessCoords).x;
	val += A5*texture2D(uFbTexture,accessCoords + vec2(xInc,0.0)).x;
	
	val += A6*texture2D(uFbTexture,accessCoords + vec2(-xInc,yInc)).x;
	val += A7*texture2D(uFbTexture,accessCoords + vec2(0.0,yInc)).x;
	val += A8*texture2D(uFbTexture,accessCoords + vec2(xInc,yInc)).x;
	
	gl_FragColor = vec4(normConst*vec3(val),1.0);
}