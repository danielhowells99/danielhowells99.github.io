//display data on canvas

precision mediump float;
uniform float uAspect;
uniform vec3 uPartColor;
varying vec2 vVelocity;

void main() {
	
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	float d = dot(circCoord, circCoord);
	if (d > 1.0) {
		discard;
	}
	float colourParam = 3.0*log(1.0 + 400.0*dot(vVelocity,vVelocity));
	float trans = min(0.1 + 0.25*colourParam,0.4);
	if(d < 0.25){
		trans = min(0.15 + 0.5*colourParam,0.8);
		if(d < 0.03325){
			trans = 0.60 + colourParam;
		}
	}

	//gl_FragColor = vec4(0.75,0.9,1.0,0.15); //GALAXY BLUE
	//gl_FragColor = vec4(0.025,0.05,0.1,0.2);
	//gl_FragColor = vec4(uPartColor,2.0*trans); //
	gl_FragColor = vec4(uPartColor,trans); //
	//gl_FragColor = vec4(uPartColor,0.33); //
	//gl_FragColor = vec4(0.04,0.005,0.14,0.15);//PURP-CHARCOAL

}