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

	//vec2 force = (-uMouseForce*0.008*mouseDisplacement/(mouseDist+1.0/4096.0) + 0.075*homeDisplacement);
	
	//vec2 force = (uMouseForce*0.01*mouseDisplacement/(mouseDist+1.0/4096.0));// + 0.001*homeDisplacement); //GOOD
	vec2 force = (uMouseForce*0.03*mouseDisplacement/(mouseDist+1.0/4096.0));// + 0.001*homeDisplacement); //GOOD
	
	//vec2 force = (uMouseForce*0.2*mouseDisplacement/(sqrt(mouseDist)+1.0/8192.0) + 0.0*homeDisplacement);
	//vec2 force = uMouseForce*0.1*mouseDisplacement/(abs(mouseDisplacement.x) + abs(mouseDisplacement.y));// + 0.8*homeDisplacement;
	//vec2 force = (0.01*uMouseForce*mouseDisplacement/(mouseDist+0.00001) + 0.1*homeDisplacement);
	velocity = 0.9*velocity + 0.025*force;
	
	if (position.x >= uAspect || position.x <= -uAspect){
		velocity.x += -0.003*(position.x-uAspect);
		//position.x *= -1.0;
	}
	
	if (position.y >= 1.0 || position.y <= -1.0){
		velocity.y += -0.003*(position.y-1.0);
		//position.y *= -1.0;
	}
	
	position += uFrameCount*velocity;
	
	position.x /= uAspect;
	gl_FragColor = vec4(position,velocity);
}