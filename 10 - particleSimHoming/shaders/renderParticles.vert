//display data on canvas
attribute vec3 aIndexData;
uniform sampler2D uDataSampler;
uniform sampler2D uHomeSampler;

varying float lineLength;

void main() {
	vec4 pointData = vec4(0.0);
	
	vec2 disp = texture2D(uDataSampler, aIndexData.xy).xy-texture2D(uHomeSampler, aIndexData.xy).xy;
	lineLength = length(disp);
	
	if (aIndexData.z > 0.0){
		pointData = texture2D(uDataSampler, aIndexData.xy);
		gl_Position = vec4(pointData.xy,0.0,1.0);
		return;
	}
	pointData = texture2D(uHomeSampler, aIndexData.xy);
	gl_Position = vec4(pointData.xy,0.0,1.0);	
	
	//gl_PointSize = 1.0;
}