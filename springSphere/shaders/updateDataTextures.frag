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

	float equDist = 1.0;

	vec4 data = texture2D(uDataSampler, vTexturePosition);
	
	vec2 position = data.xy; // p.xy 2d
	
	vec2 transformVector = vec2(0.0,0.0);
	if (uAspect > 1.0){
		transformVector = vec2(uAspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/max(uAspect,0.001));
	}
	position *= transformVector;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = transformVector*uMousePos - position;
	float mouseDist = length(mouseDisplacement);
	//float mouseDist = dot(mouseDisplacement,mouseDisplacement);
	float mouseSpringDist = mouseDist - equDist;
	vec2 normMouseVec = mouseDisplacement/mouseDist;
	
	vec2 force = 3.5*uMouseForce*normMouseVec*mouseSpringDist;
	
	for (float i = 0.0; i < 64.0;i++){
		for (float j = 0.0; j < 64.0;j++){
			vec2 testParticlePos = transformVector*texture2D(uDataSampler, vec2(i+0.5,j+0.5)/uParticleNumSq).xy;
			vec2 testDisp = testParticlePos - position;
			float testDist = length(testDisp);
			//float testDist2 = dot(testDisp,testDisp);
			if(testDist > 0.00001){
				vec2 normDisp = testDisp/testDist;
				float springDist = testDist - equDist;
				force += 0.02*normDisp*springDist;
			}
		}
		//if (brk_con > uParticleNumSq*uParticleNumSq){break;}
	}
	
	float k0 = 400.0; //SETTING 1
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
	
	float timeFactor = min(uDeltaTime,0.06);
	velocity = pow(0.96,30.0*timeFactor)*velocity + timeFactor*force;//SETTING1
	position += timeFactor*velocity;
	
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}