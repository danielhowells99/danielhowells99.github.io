precision mediump float;
varying vec2 vTexCoord; // 0 -> 1 on x and y axis
uniform float frameNumber;
uniform float aspect;

vec3 palette(in float t){
	vec3 a = vec3(0.5, 0.5, 0.5);
	vec3 b = vec3(0.5, 0.5, 0.5);
	vec3 c = vec3(1.0, 1.0, 1.0);
	//vec3 d = vec3(0.00, 0.33, 0.67); //rainbow
	vec3 d = vec3(0.05, 0.20, 0.35); //blue brown
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 comDiv(vec2 z1){
	return vec2(1.0,-1.0)*z1/(length(z1)*length(z1));
}

void main() {

	float param = frameNumber/300.0;

	vec2 uv = (2.0 * vTexCoord - 1.0);
	vec2 uvScaled = 8.0*uv;
	uvScaled *= vec2(aspect,1.0);
	//uvScaled += vec2(0.0,0.0);
	vec2 z = vec2(0.0,0.0);
	
	for(float i = 0.0; i < 10.0 ; i++){
		z = comDiv(vec2(cos(z.y + param),sin(z.x + param))) + uvScaled;
		//z = comDiv(vec2(cos(z.y),sin(z.x))) + uvScaled;
	}
	float d = mod(floor(8.0*(0.2*length(z) - 0.5*param))/8.0,1.0) ;
	//float d = floor(mod(length(z) - param,2.0));
	//float d = 0.1*length(z) - 0.5*param;
	vec4 myColor = vec4(hsv2rgb(vec3(d,0.33-0.25*sin(6.28*d),0.67+0.25*sin(6.28*d))), 1.0);
	//vec4 myColor = vec4(palette(d), 1.0);
	//vec4 myColor = vec4(d,d,d, 1.0);
	gl_FragColor = myColor;
}