//display data on canvas

attribute vec4 aVertexData;
//varying vec2 vTexturePosition;

void main() {
  gl_Position = vec4(aVertexData.xy,0.0,1.0);
  gl_PointSize = min(3.0,3.0*(aVertexData.z*aVertexData.z + aVertexData.w*aVertexData.w));
  //vTexturePosition = 0.5 + 0.5*vec2(xpos,ypos);
}