precision mediump float;

uniform sampler2D uTimeSampler;
uniform float uAnim;
varying vec2 vVertexPosition;

const float MAX_IT = 24.0;

vec4 f1(float t,float b,float p, float m,float q){
	float xCoord = 0.0;
	float yCoord = 0.0;
	float dxCoord = 0.0;
	float dyCoord = 0.0;
	float norm = 0.0;
	t *= 2.0*6.28;
	for(float i=1.0;i<=MAX_IT;i++) {
		float A = (1.0-2.0*mod(i,2.0))*pow(b,i)+p;
		float B = pow(i+q,3.0);

		float sab = sin(A*t)/B;
		float cab = cos(A*t)/B;

		xCoord += sab;
		yCoord += cab;
		dxCoord += A*cab;
		dyCoord += -A*sab;
		norm += 1.0/B;
		if (i > m){
			break;
		}
	}
	float sc = 0.85;
	return vec4(sc*xCoord/norm,sc*yCoord/norm,normalize(vec2(dxCoord,dyCoord)));	
}

vec4 f2(float t){
	float xCoord = 0.0;
	float yCoord = 0.0;
	float dxCoord = 0.0;
	float dyCoord = 0.0;
	float norm = 0.0;
	t *= 3.1415;
	for(float i=1.0;i<=2.0;i++) {
		//float A = (1.0-2.0*mod(i,2.0))*pow(2.0,i)+1.0;
		float A = (1.0-2.0*mod(i,2.0))*pow(2.0,i)-3.0;
		//float A = pow(2.0,i)+1.0;
		//float A = (1.0-2.0*mod(i,2.0))*pow(4.0,i)-3.0;;
		//float A = 1.0;
		float B = i;

		float sab = sin(A*t)/B;
		float cab = cos(A*t)/B;

		xCoord += sab;
		yCoord += cab;
		dxCoord += A*cab;
		dyCoord += -A*sab;
		norm += 1.0/B;
	}
	float sc = 0.85;
	return vec4(sc*xCoord/norm,sc*yCoord/norm,normalize(vec2(dxCoord,dyCoord)));	
}

void main() {
	float t = texture2D(uTimeSampler, vVertexPosition).x;
	//vec4 pointData = f1(t,2.0,1.0,10.0,2.0);
	vec4 pointData = f2(t);
	gl_FragColor = vec4(pointData);
}