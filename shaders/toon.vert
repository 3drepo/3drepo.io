varying vec3 Normal;
varying vec3 LightDir;

void main(void)
{
	gl_TexCoord[0]= gl_MultiTexCoord0;
	Normal = normalize(gl_NormalMatrix * gl_Normal);
	gl_ClipVertex	= gl_ModelViewMatrix * gl_Vertex;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	LightDir=vec3(gl_LightSource[0].position);
}
