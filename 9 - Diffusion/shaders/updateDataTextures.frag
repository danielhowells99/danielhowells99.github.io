precision highp float;

//manage storage buffer

uniform sampler2D uDataSampler;
uniform vec2 uScreenDimensions;
uniform float uAnim;
uniform vec2 uMousePos;
uniform float uMouseForce;

varying vec2 vTexturePosition;

vec2 my_circle(float freq, float timeScaling){
	float t = freq*timeScaling*(uAnim+140.0);
	return 0.77*vec2(cos(t),sin(t));
}

float waveFunction(float scf, vec2 uv,vec2 point){
	float t = 2.0*uAnim;
	return 0.5 + 0.5*cos(scf*length(uv-point) - t);
	//return  0.5 + 0.5*sin(scf*dot(uv-point,uv-point));
}

void main() {
	vec2 uv = vTexturePosition;
	vec2 transformVector = vec2(0.0,0.0);
	float aspect = uScreenDimensions.x/uScreenDimensions.y;
	if (aspect > 1.0){
		transformVector = vec2(aspect,1.0);
	} else {
		transformVector = vec2(1.0,1.0/aspect);
	}
	uv *= transformVector;

	float scf = 40.0;	
	float s = 0.0;//sin(scf*length(uv));
	
	const float num = 6.0;
	for (float i = 0.0;i<num;i++){
		vec2 point = my_circle(i+1.0,0.01);
		s += waveFunction(scf,uv,point);
	}
	
	float normConst = num;
	
	if (uMouseForce > 0.0){
		vec2 mouseVec = uMousePos*transformVector;
		s += waveFunction(scf,uv,mouseVec);
		normConst += 1.0;
	}
	
	s *= 1.0/normConst;
	

	
	//float quantFactor = 5.0;
	//s = (1.0/quantFactor)*floor(quantFactor*s + 0.5);
	
	gl_FragColor = vec4(1.0,1.0,1.0,pow(s,4.0));
}