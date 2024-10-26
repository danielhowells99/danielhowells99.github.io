//display data on canvas

precision mediump float;
uniform float uAspect;

void main() {
	
	float trans = 0.002;
	
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	float d = dot(circCoord, circCoord);
	if (d > 1.0) {
		discard;
	}
	if (d < 0.001) {
		trans = 0.8;
	}

	//gl_FragColor = vec4(0.75,0.9,1.0,0.15); //GALAXY BLUE
	//gl_FragColor = vec4(0.025,0.05,0.1,0.2);
	gl_FragColor = vec4(1.0,1.0,1.0,trans); //
	//gl_FragColor = vec4(0.04,0.005,0.14,0.15);//PURP-CHARCOAL

}