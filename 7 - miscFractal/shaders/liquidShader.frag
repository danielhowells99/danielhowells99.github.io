varying highp vec4 vColor;
varying highp vec2 vTexCoord;
precision highp float;

uniform float uTimeParam;
uniform float uAspect;
uniform vec3 uPartColor;
uniform vec2 uMouseLoc;

//uniform sampler2D uSampler;

const float PI = 3.1415926535897932;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
	
void main() {

	vec2 uv = (2.0 * vTexCoord - 1.0);
	vec2 transformVector = vec2(uAspect,1.0);
	
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0/uAspect,1.0);
		uv = uv.yx;
	}
	
	vec2 uvScaled = 1.0*uv;
	uvScaled *= 1.3*transformVector;
	//uvScaled += vec2(0.0,-2.0);
	vec2 z = uvScaled;
	
	float iterationReached = 0.0;
	float param = 2.0*PI*uTimeParam;
	vec2 shiftVec = vec2(-0.8032523 + 0.05*sin(param)+ 0.05*cos(param),-0.1780454+ 0.05*cos(param)) +  0.1*uMouseLoc;
	//vec2 shiftVec = vec2(-0.89 + 0.02*sin(5.0*param),0.25117+ 0.02*cos(5.0*param));
	
	for(float i = 0.0; i < 120.0 ; i++){
		z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y);
		z += shiftVec;
		if (length(z) > 4.0){
			iterationReached = i;
			break;
		}
	}
	float d = max(1.0*(iterationReached/120.0),0.005);//

	/*
	float d = 7.0*(atan(z.y,z.x)/(6.28318530718) + 0.5) + uTimeParam ;
	d = 2.0*fract(cos(3.141592*floor(2.0*d))*d);
	*/

	vec4 myColor = vec4(vec3(1.0),d);
	gl_FragColor = myColor;
}