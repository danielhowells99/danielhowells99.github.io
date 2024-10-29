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
	
	vec2 force = 18.0*(uMouseForce*mouseDisplacement/(mouseDist+1.0/2048.0));//SETTING1
	//vec2 force = 16.0*uMouseForce*mouseDisplacement/(mouseDist+1.0/2048.0);//SETTING2
	
	float k0 = 10.0; //SETTING 1
	//float k0 = 80.0; //SETTING 2
	
	float boundaryFactor = 0.875; //SETTING 1
	//float boundaryFactor = 1.0;//SETTING2
	
	float boundaryX = boundaryFactor*transformVector.x;
	float boundaryY = boundaryFactor*transformVector.y;
	float transBoxX = 0.0;
	float transBoxY = 0.0;
	
	if (position.x >= boundaryX+transBoxX){
		force.x += -k0*(position.x-boundaryX-transBoxX);
	}
	
	if (position.x <= -boundaryX+transBoxX){
		force.x += -k0*(position.x+boundaryX-transBoxX);
	}
	
	if (position.y >= boundaryY+transBoxY){
		force.y += -k0*(position.y-boundaryY-transBoxY);
	}
	
	if (position.y <= -boundaryY+transBoxY){
		force.y += -k0*(position.y+boundaryY-transBoxY);
	}
	
	//FOR CIRCULAR BOUNDARY
	/*
	float posmag = position.x*position.x + position.y*position.y - boundaryFactor;
	if (posmag >= 0.0){
		vec2 normvec = normalize(position);
		force += -0.5*k0*normvec*(posmag);
	}
	*/
	
	
	velocity = pow(0.8,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING1
	//velocity = pow(0.88,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING2
	
	position += uDeltaTime*velocity;
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}