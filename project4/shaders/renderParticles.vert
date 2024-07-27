//display data on canvas

attribute vec4 aVertexPosition;
varying vec2 vTexturePosition;

void main() {

  float xpos = 2.0*((256.0*aVertexPosition.x + aVertexPosition.y)/65535.0)-1.0;
  float ypos = 2.0*((256.0*aVertexPosition.z + aVertexPosition.w)/65535.0)-1.0;

  gl_Position = vec4(xpos,ypos,0.0,1.0);
  gl_PointSize = 1.0;
  vTexturePosition = 0.5 + 0.5*vec2(xpos,ypos);
}