//display data on canvas
attribute vec2 aIndexData;

uniform sampler2D uDataSampler;
uniform float uMinCanvDim;

void main() {
	vec4 pointData = texture2D(uDataSampler, aIndexData);
	vec2 pointCoords = pointData.xy;
	gl_Position = vec4(pointCoords,0.0,1.0);
	gl_PointSize = uMinCanvDim*0.03;
}