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

vec2 comMul(in vec2 z1, in vec2 z2){
	return vec2(z1.x*z2.x - z1.y*z2.y, z1.x*z2.y + z2.x*z1.y);
}

vec2 comDiv(in vec2 z1,in vec2 z2){
	if (length(z2) > 0.0){
		return comMul(z1,z2)/(length(z2)*length(z2));
	}
	return z1;
}

vec2 comExp(in vec2 z1){
	return exp(z1.x)*vec2(cos(z1.y),sin(z1.y));
}

vec2 comSinh(in vec2 z1){
	return 0.5*(comExp(z1) - comExp(-1.0*z1));
}

vec2 comLog(in vec2 z1){
	return vec2(log(z1.x*z1.x + z1.y*z1.y)*0.5,atan(z1.y,z1.x));
}

vec2 comPow(in vec2 z1, in float p){
	return comExp(comLog(z1)*vec2(p,p));
}

void main() {
	vec2 uv = (2.0 * vTexCoord - 1.0);
	vec2 uvScaled = 1.0*uv;
	uvScaled.x *= aspect;
	uvScaled += vec2(0.05,0.05);
	vec2 z = vec2(0.0,0.0);
	
	float iterationReached = 0.0;
	float param = frameNumber/450.0;
	
	for(float i = 0.0; i < 8.0 ; i++){
		//z = comPow(z,7.0-5.0*cos(frameNumber*0.003)) + comPow(uvScaled.yx,-2.0);
		//z =  + comPow(uvScaled.yx,-5.0*cos(frameNumber*0.003));
		//z = vec2(cos(0.1*(1.0-z.x*z.x))-sin(0.1*z.y*z.y-param),2.0*cos(z.x+param)*sin(z.y+param)) + comPow(uvScaled.yx,-1.0);
		z = comDiv(vec2(1.0,0.0),vec2(cos(cos(param)*z.y + param),sin(sin(param)*z.x + param))) + comPow(uvScaled.yx,-1.0);
	}

	float d = mod(floor(12.0*(0.2*length(z) - 0.5*param))/12.0,1.0);
	if (length(z) > 10.0){
		d = 1.0*atan(z.y,z.x) - frameNumber*0.001;
	}

	vec4 myColor = vec4(hsv2rgb(vec3(d,0.33-0.25*sin(6.28*d),0.67+0.25*sin(6.28*d))), 1.0);
	
	gl_FragColor = myColor;
}