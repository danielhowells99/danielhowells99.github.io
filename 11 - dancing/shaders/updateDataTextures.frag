precision highp float;

uniform sampler2D uDataSampler;
uniform float uAspect;

varying vec2 vTexturePosition;

void main() {

	vec4 data = texture2D(uDataSampler, vTexturePosition);
	vec2 position = data.xy;
	vec2 velocity = data.zw;
	
	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/uAspect);
	}
	
	position *= transformVector;
	position += velocity;
	
	
	//float boundaryFactor = 0.875; //SETTING 1
	float boundaryFactor = 1.0;//SETTING2
	
	float boundaryX = boundaryFactor*transformVector.x;
	float boundaryY = boundaryFactor*transformVector.y;
	
	if (position.x >= boundaryX){
		position.x -= 2.0*(position.x-boundaryX);
		velocity.x *= -1.0;
		//position.x = -boundaryX;
	}
	
	else if (position.x <= -boundaryX){
		position.x -= 2.0*(position.x+boundaryX);
		velocity.x *= -1.0;
		//position.x = boundaryX;
	}
	
	if (position.y >= boundaryY){
		position.y -= 2.0*(position.y-boundaryY);
		velocity.y *= -1.0;
		//position.y = -boundaryY;
	}
	
	else if (position.y <= -boundaryY){
		position.y -= 2.0*(position.y+boundaryY);
		velocity.y *= -1.0;
		//position.y = boundaryY;
	}
	
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}