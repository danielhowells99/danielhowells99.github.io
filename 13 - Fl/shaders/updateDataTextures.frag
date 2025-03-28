precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform vec2 uScreenDimensions;
uniform float uDeltaTime;
uniform vec2 uMousePos;
uniform vec2 uMousePosPrev;
uniform float uMouseForce;

varying vec2 vTexturePosition;

void main() {
	vec2 transformVector = vec2(0.0,0.0);
	if (uMouseForce > 0.0){
		float aspect = uScreenDimensions.x/uScreenDimensions.y;
		if (aspect > 1.0){
			transformVector = vec2(aspect,1.0);
		} else {
			transformVector = vec2(1.0,1.0/aspect);
		}
	}

	vec2 mousePosRel = transformVector*uMousePos;
	vec2 mousePosPrevRel = transformVector*uMousePosPrev;
	float rad = length(mousePosPrevRel-mousePosRel);
	if ((length((2.0*vTexturePosition-1.0)*transformVector - mousePosRel) < 1.4*rad) && (uMouseForce > 0.0)){
			gl_FragColor = vec4(1.0,1.0,1.0,1.0);
	} else {

		float xInc = 1.0/uScreenDimensions.x;
		float yInc = 1.0/uScreenDimensions.y;
		vec2 accessCoords = vTexturePosition;

		float data = texture2D(uDataSampler, accessCoords).w;
		
		float cell_north = texture2D(uDataSampler, accessCoords + vec2(0.0,yInc)).w;
		float cell_south = texture2D(uDataSampler, accessCoords + vec2(0.0,-yInc)).w;
		float cell_west = texture2D(uDataSampler, accessCoords + vec2(-xInc,0.0)).w;
		float cell_east = texture2D(uDataSampler, accessCoords + vec2(xInc,0.0)).w;
		
		float k = 4.0;
		float avg = (data + k*(cell_east+cell_north+cell_south+cell_west))/(1.0+4.0*k);

		gl_FragColor = vec4(1.0,1.0,1.0,avg);
	}
}