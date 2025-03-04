precision mediump float;

varying float vt;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	//float intensity = length(gl_FragCoord.xy);
	float colFreq = 8.0;
	vec3 outcol = hsv2rgb(vec3(colFreq*vt,0.5-0.25*sin(colFreq*2.0*3.1415*vt),0.75+0.25*sin(colFreq*2.0*3.1415*vt)));
	//vec3 outcol = hsv2rgb(vec3(244.0/360.0,0.5-0.25*sin(12.0*2.0*3.1415*vt),0.75+0.25*sin(12.0*2.0*3.1415*vt)));
	gl_FragColor = vec4(outcol,0.04);
}