precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform sampler2D uHomeSampler;

uniform float uAspect;

uniform float uFrameCount;
uniform vec2 uMousePos;
uniform float uMouseForce;

varying vec2 vTexturePosition;

void main() {

	vec4 data = texture2D(uDataSampler, vTexturePosition);
	vec4 homeData = texture2D(uHomeSampler, vTexturePosition);
	
	vec2 position = data.xy; // p.xy 2d
	position.x *= uAspect;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;

	vec2 homeDisplacement = vec2(homeData.x*uAspect,homeData.y)- position;

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
	gl_FragColor = vec4(position,velocity);
}