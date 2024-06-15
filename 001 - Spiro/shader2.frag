precision mediump float;
varying vec2 vTexCoord; // 0 -> 1 on x and y axis
uniform float frameNumber;
uniform float aspect;

vec3 palette(in float t){
	vec3 a = vec3(0.5, 0.5, 0.5);
	vec3 b = vec3(0.5, 0.5, 0.5);
	vec3 c = vec3(1.0, 1.0, 1.0);
	vec3 d = vec3(0.40, 0.5, 0.6);
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	vec2 uv = (2.0 * vTexCoord - 1.0);
	vec2 uvScaled = 1.0*uv;
	uvScaled.x *= aspect;
	//uvScaled += vec2(0.0,-2.0);
	vec2 z = uvScaled;
	
	float iterationReached = 0.0;
	float param = frameNumber/400.0;
	vec2 shiftVec = vec2(-0.8032523 + 0.05*sin(param)+ 0.05*cos(param),-0.1780454+ 0.05*cos(param));
	//vec2 shiftVec = vec2(-0.89 + 0.02*sin(5.0*param),0.25117+ 0.02*cos(5.0*param));
	
	for(float i = 0.0; i < 120.0 ; i++){
		z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y);
		z += shiftVec;
		if (length(z) > 4.0){
			iterationReached = i;
			break;
		}
	}
	float d = 0.7+2.0*(iterationReached/120.0);//

	
	//vec4 myColor = vec4(palette(2.0*d), 1.0);
	//vec4 myColor = vec4(1.0*d,2.0*d,3.0*d, 1.0);
	//vec4 myColor = vec4(1.2*d,0.7*d,0.4*d, 1.0); //gold
	//vec4 myColor = vec4(1.05*d,0.95*d,1.2*d, 1.0); //silver
	//vec4 myColor = vec4(2.0*d,1.1*d,0.5*d, 1.0); //copper
	//vec4 myColor = vec4(1.0*d,1.5*d,3.0*d, 1.0);
	vec4 myColor = vec4(hsv2rgb(vec3(d,0.5-0.4*sin(6.28*d),0.5+0.4*sin(6.28*d))), 1.0);
	gl_FragColor = myColor;
}