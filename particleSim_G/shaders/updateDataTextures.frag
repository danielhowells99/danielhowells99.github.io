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

	vec4 data = texture2D(uDataSampler, vTexturePosition);
	
	vec2 position = data.xy; // p.xy 2d
	position.x *= uAspect;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;
	
	vec2 force = -8.0*(uMouseForce*mouseDisplacement/(mouseDist+1.0/2048.0));//SETTING1
	
	float equDist = 1.0;
	
	float brk_con = 0.0;
	
	for (float i = 0.0; i < 100.0;i++){
		for (float j = 0.0; j < 100.0;j++){
			vec2 testParticlePos = vec2(uAspect,1.0)*texture2D(uDataSampler, vec2(i,j)/uParticleNumSq).xy;
			vec2 testDisp = testParticlePos - position;
			float testDist = length(testDisp);
			if(testDist > 0.0){
				float springDist = testDist - equDist;
				float angle = atan(testDisp.y,testDisp.x);
				force += vec2(0.02*cos(angle)*springDist,0.02*sin(angle)*springDist);
			}
			++brk_con;
		}
		//if (brk_con > uParticleNumSq*uParticleNumSq){break;}
	}
	
	float k0 = 100.0; //SETTING 1
	float boundaryFactor = 0.875;//SETTING2
	
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
	
	velocity = pow(0.95,30.0*uDeltaTime)*velocity + uDeltaTime*force;//SETTING1
	
	position += uDeltaTime*velocity;
	position.x /= uAspect;
	gl_FragColor = vec4(position,velocity);
}