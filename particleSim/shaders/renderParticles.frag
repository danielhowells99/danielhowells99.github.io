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
	gl_FragColor = vec4(1.0,1.0,0.9,0.15);
	//gl_FragColor = vec4(0.75,0.9,1.0,0.15); //GALAXY BLUE
	//gl_FragColor = vec4(0.98,0.94,0.82,0.3);
	
	//gl_FragColor = vec4(0.05,0.1,0.15, 0.3);
	//gl_FragColor = vec4(0.975,0.95,0.925, 0.3);
	
	//gl_FragColor = vec4(0.5-0.5*scalefactor,0.3,scalefactor,1.0);
}