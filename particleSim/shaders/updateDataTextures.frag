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
	
	vec2 position = data.xy; // p.xy 2d
	position.x *= uAspect;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;
	
	vec2 force = 20.0*(uMouseForce*mouseDisplacement/(mouseDist+1.0/2048.0));
	
	float k0 = 10.0; //SETTING 2
	float boundaryFactor = 0.875;
	
	float boundaryX = boundaryFactor*uAspect;
	float boundaryY = boundaryFactor;
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
	float posmag = position.x*position.x + position.y*position.y - boundaryFactor*min(1.0,uAspect*uAspect);
	if (posmag >= 0.0){
		float angle = atan(position.y,position.x);
		posmag = length(posmag);
		force.x += -k0*cos(angle)*(posmag);
		force.y += -k0*sin(angle)*(posmag);
	}
	*/
	
	//velocity = pow(0.00763,uDeltaTime)*velocity + uDeltaTime*force;//SETTING1
	velocity = pow(0.8,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING2
	
	position += uDeltaTime*velocity;
	position.x /= uAspect;
	gl_FragColor = vec4(position,velocity);
}