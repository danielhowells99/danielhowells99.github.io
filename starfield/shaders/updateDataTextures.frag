#version 300 es
precision highp float;

layout(location = 0) out vec4 outColor0;
layout(location = 1) out vec4 outColor1;

//manage storage buffer

uniform sampler2D uPositionSampler; //TRY U SAMPLER TO GET UINT8 VALUE
uniform sampler2D uVelocitySampler; //TRY U SAMPLER TO GET UINT8 VALUE
uniform sampler2D uHomeSampler;

uniform float uAspect;
uniform float uParticleNumSqd;

uniform float uFrameCount;
uniform vec2 uMousePos;
uniform float uMouseForce;

in vec2 vTexturePosition;

float q(float a1, float a2){
	return (256.0*a1 + a2)/65535.0;
}

vec2 p(vec4 a){
	return vec2(q(a.x,a.y),q(a.z,a.w));
}

vec2 untangle(float x){
	return vec2(floor(x/256.0),mod(x,256.0));
}

void main() {

	vec4 homeData = floor(255.0*texture(uHomeSampler, vTexturePosition));
	vec4 positionData = floor(255.0*texture(uPositionSampler, vTexturePosition));
	vec4 velocityData = floor(255.0*texture(uVelocitySampler, vTexturePosition));
	
	vec2 position = 2.0*p(positionData)-1.0; // p.xy 2d
	position.x *= uAspect;

	vec2 homePosition = 2.0*p(homeData)-1.0; // p.xy 2d
	homePosition.x *= uAspect;

	vec2 velocity = 2.0*p(velocityData)-1.0; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;

	vec2 homeDisplacement = homePosition - position;
	float homeDist = homeDisplacement.x*homeDisplacement.x + homeDisplacement.y*homeDisplacement.y;

	
	vec2 force = 1.0*(-uMouseForce*0.015*mouseDisplacement/(mouseDist) + 0.1*homeDisplacement);
	velocity = 0.995*velocity + force;
	
	position += 0.01*velocity;
	
	if (position.x >= uAspect || position.x <= -uAspect){
		velocity.x *= -1.0;
		position += 0.02*velocity;
		//position.x *= -1.0;
	}
	
	if (position.y >= 1.0 || position.y <= -1.0){
		velocity.y *= -1.0;
		position += 0.02*velocity;
		//position.y *= -1.0;
	}
	
	
	position.x /= uAspect;

	position = 65535.0*(0.5*position + 0.5); // p.xy 2d
	velocity = 65535.0*(0.5*velocity + 0.5); //v.xy 2d

	vec4 PosColorOut = vec4(untangle(position.x),untangle(position.y))/255.0;
	vec4 VelColorOut = vec4(untangle(velocity.x),untangle(velocity.y))/255.0;

	outColor0 = PosColorOut;
	outColor1 = VelColorOut;
}