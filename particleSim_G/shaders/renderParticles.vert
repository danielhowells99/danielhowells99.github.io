//display data on canvas
attribute vec2 aIndexData;

uniform sampler2D uDataSampler;
varying vec2 vVelocity;

void main() {
	vec4 pointData = texture2D(uDataSampler, aIndexData);
	vec2 pointCoords = pointData.xy;
	gl_Position = vec4(pointCoords,0.0,1.0);
	gl_PointSize = 800.0*0.04;
	vVelocity = pointData.zw;
}