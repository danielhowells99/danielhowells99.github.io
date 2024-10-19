//display data on canvas

attribute vec4 aVertexData;
varying vec2 vVelocity;

void main() {
  gl_Position = vec4(aVertexData.xy,0.0,1.0);
  gl_PointSize = 1.0;//min(1.0,400.0*(aVertexData.z*aVertexData.z + aVertexData.w*aVertexData.w));
  //gl_PointSize = 2.0;
  vVelocity = vec2(aVertexData.z,aVertexData.w);
}