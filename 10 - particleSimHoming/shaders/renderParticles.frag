//display data on canvas

precision mediump float;
varying float lineLength;

void main() {
	gl_FragColor = vec4(1.0,1.0,1.0,0.1*exp(-5.0*lineLength));
}