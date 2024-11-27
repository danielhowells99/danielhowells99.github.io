varying highp vec4 vColor;
varying highp vec2 vTexCoord;
precision highp float;

uniform float uTimeParam;
uniform float uAspect;
uniform vec3 uPartColor;

//uniform sampler2D uSampler;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
	
void main() {
	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/uAspect);
	}

	vec2 uv = 2.0*vTexCoord-1.0;
	vec2 uvScaled = 2.0*uv;
	uvScaled *= transformVector;
	uvScaled += vec2(6.0,9.5);
	vec2 z = vec2(0.0,0.0);
	
	float iterationReached = 0.0;
	float param = 0.4*uTimeParam;
	
	for(float i = 0.0; i < 13.0 ; i++){
		z = vec2(cos(0.1*(1.0-z.x*z.x))-sin(0.1*z.y*z.y-param) + uvScaled.x,2.0*cos(z.x+param)*sin(z.y+param) + uvScaled.y);
		if (length(z) > 20.0){
			iterationReached = i;
			break;
		}
	}
	float d = 1.5*atan(z.y,z.x) + uTimeParam*0.1 + 0.6;
	d = mod(cos(floor(d)*3.1415)*d,1.0);

	//float d = 0.5*(1.0+cos(uTimeParam*0.01 + 0.5 + 4.0*atan(z.y,z.x)));

	vec4 myColor = vec4(vec3(1.0),d);
	//vec4 myColor = vec4(hsv2rgb(vec3(d + 0.01,0.33-0.25*sin(6.28*d),0.67+0.25*sin(6.28*d))), 1.0); //GOOD!
	gl_FragColor = myColor;
}