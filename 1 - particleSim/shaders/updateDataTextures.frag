precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform float uAspect;
uniform float uDeltaTime;
uniform vec2 uMousePos;
uniform float uMouseForce;

varying vec2 vTexturePosition;

void main() {

	vec4 data = texture2D(uDataSampler, vTexturePosition);

	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/uAspect);
	}
	
	vec2 position = data.xy; // p.xy 2d
	position *= transformVector;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = transformVector*uMousePos - position;
	float mouseDist = dot(mouseDisplacement,mouseDisplacement);
	
	vec2 force = 18.0*(uMouseForce*mouseDisplacement/(mouseDist + 1.0/2048.0));//SETTING1
	//vec2 force = 16.0*uMouseForce*mouseDisplacement/(mouseDist+ 1.0/2048.0);//SETTING2
	//vec2 force = -1.0*uMouseForce*mouseDisplacement/(mouseDist);//SETTING2
	
	//float k0 = 12.0; //SETTING 1
	float k0 = 80.0; //SETTING 2
	
	//float boundaryFactor = 0.875; //SETTING 1
	float boundaryFactor = 1.0;//SETTING2
	
	
	float boundaryX = boundaryFactor*transformVector.x;
	float boundaryY = boundaryFactor*transformVector.y;
	
	if (position.x >= boundaryX){
		force.x += -k0*(position.x-boundaryX);
		//position.x -= 2.0*(position.x-boundaryX);
		//velocity.x *= -0.5;
	}
	
	else if (position.x <= -boundaryX){
		force.x += -k0*(position.x+boundaryX);
		//position.x -= 2.0*(position.x+boundaryX);
		//velocity.x *= -0.5;
	}
	
	if (position.y >= boundaryY){
		force.y += -k0*(position.y-boundaryY);
		//position.y -= 2.0*(position.y-boundaryY);
		//velocity.y *= -0.5;
	}
	
	else if (position.y <= -boundaryY){
		force.y += -k0*(position.y+boundaryY);
		//position.y -= 2.0*(position.y+boundaryY);
		//velocity.y *= -0.5;
	}
	
	
	//FOR CIRCULAR BOUNDARY
	/*
	float posmag = position.x*position.x + position.y*position.y - boundaryFactor;
	if (posmag >= 0.0){
		vec2 norm1 = position/length(position);
		force += -1.0*k0*norm1*posmag*posmag;
	}
	*/
	
	//velocity = pow(0.81,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING1
	velocity = pow(0.88,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING2
	//velocity = pow(0.99,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING2
	
	position += uDeltaTime*velocity;
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}