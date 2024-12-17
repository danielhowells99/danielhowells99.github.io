precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform vec2 uScreenDimensions;
uniform float uDeltaTime;
uniform vec2 uMousePos;
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
	if ((length((2.0*vTexturePosition-1.0)*transformVector - transformVector*uMousePos) < 0.15) && (uMouseForce > 0.0)){
			gl_FragColor = vec4(1.0,1.0,1.0,0.2);
	} else {

		float data = texture2D(uDataSampler, vTexturePosition).w;
		float losesTo = 0.0;
		
		if (data < 0.4){losesTo = 0.5;}
		else if (data < 0.7){losesTo = 0.8;}
		else {losesTo = 0.2;}
		
		float xInc = 1.0/uScreenDimensions.x;
		float yInc = 1.0/uScreenDimensions.y;
		
		float losses = 0.0;
		for (float i = -1.0;i <= 1.0;i++){
			for (float j = -1.0;j <= 1.0;j++){
				if ((i != 0.0) || (j != 0.0)){
					vec2 accesCoords = vTexturePosition + vec2(i*xInc,j*yInc);
					float opponent = texture2D(uDataSampler, accesCoords).w;
					if (abs(opponent - losesTo) < 0.1){
						losses++;
					}
				}
			}
		}
		
		if (losses > 2.0){data = losesTo;}
		
		
		gl_FragColor = vec4(1.0,1.0,1.0,data);
	}
}