//display data on canvas

precision mediump float;

uniform float uAspect;
//uniform sampler2D uSizeSampler;
//uniform float uParticleNumSq;

//varying float vIndexData;

void main() {
	/*
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	if (dot(circCoord, circCoord) > 1.0) {
		discard;
	}
	*/
	
	gl_FragColor = vec4(1.0,1.0,1.0,0.2);
	
	//gl_FragColor = vec4(0.75,0.9,1.0,0.15); //GALAXY BLUE
	
	//gl_FragColor = vec4(0.98,0.94,0.82,0.15); //SILVERTONE
	
	//gl_FragColor = vec4(0.05527125,0.0073695,0.1842375,0.3);//char1
	//gl_FragColor = vec4(0.055,0.007,0.184,0.15);//char2
	//gl_FragColor = vec4(0.055,0.007,0.184,0.3);//char3
	//gl_FragColor = vec4(0.04,0.005,0.14,0.15);//char4

}