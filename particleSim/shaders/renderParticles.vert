//display data on canvas

attribute vec4 aVertexData;
//attribute float aIndexData;

//uniform sampler2D uSizeSampler;
//uniform float uParticleNumSq;

//varying float vIndexData;

void main() {
	
	//float scalefactor = texture2D(uSizeSampler, vec2(mod(aIndexData,uParticleNumSq)/uParticleNumSq,floor(aIndexData/uParticleNumSq)/uParticleNumSq)).x;

	gl_Position = vec4(aVertexData.xy,0.0,1.0);
	gl_PointSize = 1.0;//min(1.0,400.0*(aVertexData.z*aVertexData.z + aVertexData.w*aVertexData.w));
	//vIndexData = aIndexData;
	//gl_PointSize = 2.0;
}