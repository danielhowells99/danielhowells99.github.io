//display data on canvas

precision mediump float;

varying float vVal;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	float val = 0.8*vVal;
	vec3 outCol = hsv2rgb(vec3((0.75+val*val),0.7+0.3*cos(6.28*val*val),0.6-0.4*cos(6.28*val*val)));
	gl_FragColor = vec4(outCol,0.5*val*val);
	//gl_FragColor = vec4(outCol,0.1);
}