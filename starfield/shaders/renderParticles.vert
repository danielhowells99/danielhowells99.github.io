//display data on canvas

attribute vec4 aVertexPosition;
attribute vec4 aVertexVelocity;
//varying vec2 vTexturePosition;

void main() {

  float xpos = 2.0*((256.0*aVertexPosition.x + aVertexPosition.y)/65535.0)-1.0;
  float ypos = 2.0*((256.0*aVertexPosition.z + aVertexPosition.w)/65535.0)-1.0;

  float xvel = 2.0*((256.0*aVertexVelocity.x + aVertexVelocity.y)/65535.0)-1.0;
  float yvel = 2.0*((256.0*aVertexVelocity.z + aVertexVelocity.w)/65535.0)-1.0;

  gl_Position = vec4(xpos,ypos,0.0,1.0);
  gl_PointSize = 3.0*(xvel*xvel + yvel*yvel);
  //vTexturePosition = 0.5 + 0.5*vec2(xpos,ypos);
}