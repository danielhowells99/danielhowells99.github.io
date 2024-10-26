attribute vec4 aVertexPosition;
varying highp vec2 vTexCoord;

void main() {
	gl_Position = aVertexPosition;
	vTexCoord = 0.5*aVertexPosition.xy+0.5;;
}