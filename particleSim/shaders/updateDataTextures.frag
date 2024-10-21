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
	
	vec2 position = data.xy; // p.xy 2d
	position.x *= uAspect;

	vec2 velocity = data.zw; //v.xy 2d

	vec2 mouseDisplacement = uMousePos - position;
	float mouseDist = mouseDisplacement.x*mouseDisplacement.x + mouseDisplacement.y*mouseDisplacement.y;
	
	vec2 force = 3.8*(uMouseForce*mouseDisplacement/(mouseDist+1.0/4096.0));
	//vec2 force = 1.2*(uMouseForce*mouseDisplacement/(mouseDist+1.0/4096.0));
	//vec2 force = 0.005*(uMouseForce*mouseDisplacement/(abs(mouseDisplacement.x)+abs(mouseDisplacement.y)));
	//vec2 force = (uMouseForce*0.001*mouseDisplacement/(mouseDist+1.0/8192.0));

	/*
	vec4 homeData = texture2D(uHomeSampler, vTexturePosition);
	vec2 homeDisplacement = vec2(homeData.x*uAspect,homeData.y)- position;
	vec2 force = (-uMouseForce*0.03*mouseDisplacement/(mouseDist) + homeDisplacement);
	*/

	
	//float k0 = 0.0025;
	float k0 = 12.0;
	float boundary = 0.8;

	
	if (position.x >= boundary*uAspect){
		velocity.x += -k0*(position.x-boundary*uAspect);
	}
	
	if (position.x <= -boundary*uAspect){
		velocity.x += -k0*(position.x+boundary*uAspect);
	}
	
	if (position.y >= boundary*1.0){
		velocity.y += -k0*(position.y-boundary*1.0);
	}
	
	if (position.y <= -boundary*1.0){
		velocity.y += -k0*(position.y+boundary*1.0);
	}
	
	/*
	float posmag = position.x*position.x + position.y*position.y - boundary*min(1.0,uAspect*uAspect);
	if (posmag >= 0.0){
		float angle = atan(position.y,position.x);
		velocity.x += -k0*cos(angle)*(posmag);
		velocity.y += -k0*sin(angle)*(posmag);
	}
	*/
	
	//velocity = 0.87*velocity + force;
	velocity = 0.6*velocity + force;
	position += 0.002*uFrameCount*velocity;
	
	position.x /= uAspect;
	gl_FragColor = vec4(position,velocity);
}