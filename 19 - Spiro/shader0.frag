precision highp float;
varying vec2 vTexCoord; // 0 -> 1 on x and y axis
uniform float frameNumber;
uniform float aspect;

vec3 palette(in float t){
	vec3 a = vec3(0.5, 0.5, 0.5);
	vec3 b = vec3(0.5, 0.5, 0.5);
	vec3 c = vec3(1.0, 1.0, 1.0);
	vec3 d = vec3(0.00, 0.10, 0.20);
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
	vec2 uvScaled = 0.2*exp(-(1.0+15.0*abs(mod(frameNumber+540.0,1080.0)/1080.0-0.5)))*uv; // -1 -> 1 on x and y axis
	//vec2 uvScaled = 0.02*uv; // -1 -> 1 on x and y axis
	uvScaled.x *= aspect;
	//uvScaled += vec2(-0.7461,-0.110);
	//uvScaled += vec2(-0.8,-0.1658);
	uvScaled += vec2(-0.8032523,-0.1780454);
	//uvScaled += vec2(-1.16433725,0.21641975);
	vec2 z = vec2(0.0,0.0);
	
	float iterationReached = 0.0;
	float blacken = 0.0;
	
	for(float i = 0.0; i < 150.0 ; i++){
		z = vec2(z.x*z.x - z.y*z.y + uvScaled.x, 2.0*z.x*z.y + uvScaled.y);
		if (length(z) > 4.0){
			iterationReached = i;
			blacken = 1.0;
			break;
		}
	}
	float d = 2.0*(1.0-iterationReached/150.0);
	//float relD = length(uv);
	
	//vec4 myColor = vec4(blacken*palette(d), 1.0);
	//vec4 myColor = vec4(blacken*1.0*d,blacken*1.0*d,blacken*1.0*d, 1.0);
	vec4 myColor = vec4(hsv2rgb(vec3(d,0.33-0.25*sin(6.28*d),blacken*(0.67+0.25*sin(6.28*d)))), 1.0);
	gl_FragColor = myColor;
}