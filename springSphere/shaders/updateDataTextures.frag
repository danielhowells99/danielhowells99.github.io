precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform float uAspect;
uniform float uDeltaTime;
uniform vec2 uMousePos;
uniform float uMouseForce;
uniform float uParticleNumSq;

varying vec2 vTexturePosition;

void main() {

	float equDist = 1.1;

	vec4 data = texture2D(uDataSampler, vTexturePosition);
	
	vec2 position = data.xy; // p.xy 2d
	
	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/uAspect);
	}
	position *= transformVector;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;
	float mouseSpringDist = mouseDist - equDist;
	float mouseAngle = atan(mouseDisplacement.y,mouseDisplacement.x);

	
	vec2 force = 10.0*uMouseForce*vec2(cos(mouseAngle)*mouseSpringDist,sin(mouseAngle)*mouseSpringDist);
	
	float brk_con = 0.0;
	
	for (float i = 0.0; i < 86.0;i++){
		for (float j = 0.0; j < 86.0;j++){
			vec2 testParticlePos = transformVector*texture2D(uDataSampler, vec2(i,j)/uParticleNumSq).xy;
			vec2 testDisp = testParticlePos - position;
			float testDist = length(testDisp);
			//float testDist = dot(testDisp,testDisp);
			if(testDist > 0.0){
				float springDist = testDist - equDist;
				float angle = atan(testDisp.y,testDisp.x);
				force += vec2(0.01*cos(angle)*springDist,0.01*sin(angle)*springDist);
			}
			++brk_con;
		}
		//if (brk_con > uParticleNumSq*uParticleNumSq){break;}
	}
	
	float k0 = 80.0; //SETTING 1
	float boundaryFactor = 1.0;//SETTING2
	
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
	
	
	/*
	float posmag = position.x*position.x + position.y*position.y - 0.8*min(1.0,uAspect*uAspect);
	if (posmag >= 0.0){
		float angle = atan(position.y,position.x);
		posmag = length(posmag);
		force.x += -100.0*cos(angle)*(posmag);
		force.y += -100.0*sin(angle)*(posmag);
	}
	*/
	
	
	velocity = pow(0.94,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING1
	position += uDeltaTime*velocity;
	
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}