//display data on canvas
attribute vec3 aIndexData;

uniform sampler2D uDataSampler;
uniform vec2 uScreenDimensions;
uniform float uAnim;
uniform int uPointMode;

varying float vt;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {

	vec2 transformVector = vec2(0.0,0.0);
	if (uScreenDimensions.x > uScreenDimensions.y){
		transformVector = vec2(uScreenDimensions.y/uScreenDimensions.x,1.0);
	} else {
		transformVector = vec2(1.0,uScreenDimensions.x/uScreenDimensions.y);
	}

	vec4 data = texture2D(uDataSampler,aIndexData.xy);
	vec2 xy = data.xy;
	vec2 dxdy = data.zw;

	vec2 position = xy;

	vt = abs(aIndexData.z);

	dxdy = rotate2d(6.28*(uAnim - vt))*dxdy;
	//dxdy *= rotate2d(6.28*(uAnim));

	float tangentLength = 4.0;
	
	if (uPointMode == 0){
		if (aIndexData.z <= 0.0){
			position += tangentLength*dxdy;
		} else {
			position -= tangentLength*dxdy;
		}
	}

	position *= transformVector;

	gl_Position = vec4(position,0.0,1.0);	
	gl_PointSize = 1.0;
}