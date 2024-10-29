//display data on canvas

precision mediump float;
uniform float uAspect;
uniform vec3 uPartColor;
varying vec2 vVelocity;

void main() {
	
	float velScale = length(vVelocity);
	
	vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
	float d = dot(circCoord, circCoord);
	if (d > 1.0) {
		discard;
	}
	float trans = min(0.1 + velScale,0.75);
	if(d < (0.005 + 0.25*velScale)){
		trans = 1.0;
	}

	//gl_FragColor = vec4(0.75,0.9,1.0,0.15); //GALAXY BLUE
	//gl_FragColor = vec4(0.025,0.05,0.1,0.2);
	//gl_FragColor = vec4(uPartColor,2.0*trans); //
	gl_FragColor = vec4(uPartColor,trans); //
	//gl_FragColor = vec4(uPartColor,0.33); //
	//gl_FragColor = vec4(0.04,0.005,0.14,0.15);//PURP-CHARCOAL

}