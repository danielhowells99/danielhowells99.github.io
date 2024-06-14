precision mediump float;

varying vec2 vTexCoord;

varying vec3 vNormal;
varying vec3 absolute;
void main() {
  //vec3 color = vNormal * 0.5 + 0.5;
  vec3 color = vec3(1.0,1.0,1.0)*(-1.0+1.1*length(absolute));
  gl_FragColor = vec4(color ,1.0);
}