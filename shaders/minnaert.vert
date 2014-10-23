//
// Minnaert reflection model (per-pixel)
//
// by
// Massimiliano Corsini
// Visual Computing Lab (2006)
//

varying vec3 normal;
varying vec3 vpos;

void main (void)
{
	gl_TexCoord[0]= gl_MultiTexCoord0;
	// vertex normal
	normal = gl_NormalMatrix * gl_Normal;
	
	// vertex position (in eye-space)
	vpos = vec3(gl_ModelViewMatrix * gl_Vertex);
	gl_ClipVertex	= gl_ModelViewMatrix * gl_Vertex;
	
        gl_FrontColor = gl_Color; 	
	gl_Position = ftransform();
}
