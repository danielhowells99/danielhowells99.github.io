//display data on canvas

precision mediump float;

uniform sampler2D uFbTexture;
uniform vec2 uScreenDimensions;
uniform vec3 uPartColor;

varying vec2 vTexPosition;

vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	vec2 accessCoords = vTexPosition;// + 0.5/uScreenDimensions;	
	float s = texture2D(uFbTexture,accessCoords).x;
	//vec3 finalOutCol = hsv2rgb(vec3(0.9+0.1*s,1.0-0.8*s*s,0.07+0.93*s));
	vec3 finalOutCol = hsv2rgb(vec3(0.7-0.2*s,1.0-0.9*s,0.07+1.0*s));
	//vec3 finalOutCol = hsv2rgb(vec3(0.55+0.7*s,1.0-s,s));	
	//vec3 finalOutCol = vec3(s);	

	gl_FragColor = vec4(finalOutCol,1.0);
}