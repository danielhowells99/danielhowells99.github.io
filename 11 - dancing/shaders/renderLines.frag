//display data on canvas

precision mediump float;

varying float vVal;
uniform float uLogFlag; 

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	float s = vVal;
	float ss = s*s;
	
	vec3 outCol = hsv2rgb(vec3((0.75+ss),0.7+0.3*cos(6.28*ss),0.6-0.4*cos(6.28*ss)));
	gl_FragColor = vec4(outCol,0.4*ss);
	//gl_FragColor = vec4(vec3(1.0),0.4*ss);
}