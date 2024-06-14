attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord; // 0 -> 1 on x and y axis

uniform float leftHalf;

void main() {
	vTexCoord = aTexCoord;
	vec4 positionVec4 = vec4(aPosition, 1.0);
	positionVec4.xy = positionVec4.xy * vec2(1.0,2.0) - vec2(leftHalf,1.0);
	gl_Position = positionVec4;
}