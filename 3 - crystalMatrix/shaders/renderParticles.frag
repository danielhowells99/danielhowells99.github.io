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
	float colourParam = 4.0*log(1.0 + 300.0*dot(vVelocity,vVelocity));
	float trans = min(0.1 + 0.25*colourParam,0.4);
	if(d < 0.25){
		trans = min(0.15 + 0.5*colourParam,0.8);
		if(d < 0.03325){
			trans = 0.60 + colourParam;
		}
	}

	gl_FragColor = vec4(vec3(1.0),trans); //

}