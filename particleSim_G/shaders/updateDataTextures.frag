precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform float uAspect;
uniform float uDeltaTime;
uniform vec2 uMousePos;
uniform float uMouseForce;
uniform float uParticleNumSq;

varying vec2 vTexturePosition;

const float objRad = 0.08;

void main() {

	float equDist = 1.0;

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

	vec2 mouseDisplacement = transformVector*uMousePos - position;
	float mouseDistSq = dot(mouseDisplacement,mouseDisplacement);
	float mouseDist = sqrt(mouseDistSq);
	//float mouseSpringDist = mouseDist - equDist;
	
	vec2 force = vec2(0.0,0.0);//*uMouseForce*mouseNorm/max(mouseDistSq,0.01);
	if(mouseDist <= objRad){
		float md = (objRad - mouseDist);
		vec2 mouseNorm = mouseDisplacement/sqrt(mouseDist);
		force += -uMouseForce*69.0*mouseNorm*md;
	}
	
	float brk_con = 0.0;
	
	for (float i = 0.0; i < 23.0;i++){
		for (float j = 0.0; j < 23.0;j++){
			vec2 testParticlePos = transformVector*texture2D(uDataSampler, vec2(i+0.5,j+0.5)/uParticleNumSq).xy;
			vec2 testDisp = testParticlePos - position;
			float sqDist = dot(testDisp,testDisp);
		
			if(sqDist > 0.0000001){
				float dist = sqrt(sqDist);
				vec2 normVec = testDisp/dist;
				force += 0.000015*normVec/max(sqDist,objRad*objRad);
				if(dist <= objRad){
					float ddd = (objRad - dist);
					force += -18.0*normVec*ddd;
				}
			}
		}
		//if (brk_con > uParticleNumSq*uParticleNumSq){break;}
	}
	
	float k0 = 30.0; //SETTING 1
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
	
	float timeFactor = 6.0*clamp(uDeltaTime,0.004,0.03);
	velocity = pow(0.95,5.0*timeFactor)*velocity + timeFactor*force;//SETTING1
	//velocity = 0.98*velocity + timeFactor*force;//SETTING1
	position += timeFactor*velocity;
	//position += velocity;
	position /= transformVector;
	gl_FragColor = vec4(position,velocity);
}