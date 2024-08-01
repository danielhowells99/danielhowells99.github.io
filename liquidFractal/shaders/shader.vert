attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec4 aVertexColor;

varying lowp vec4 vColor;
varying highp vec2 vTexCoord;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vColor = aVertexColor;
	vTexCoord = aTexCoord;
}