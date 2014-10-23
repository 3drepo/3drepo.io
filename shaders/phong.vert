//VERTEX SHADER
varying vec3 normal, lightDir,I;
varying vec4 Cs;

void main()
{	
    vec4 P = gl_ModelViewMatrix * gl_Vertex;
    gl_ClipVertex= P;
    lightDir = normalize(vec3(gl_LightSource[0].position));
    I = P.xyz;
    normal = normalize(gl_NormalMatrix * gl_Normal);
	
    // Orange
    Cs= vec4(0.5,0.5,0.5,0.2);
    gl_FrontColor = gl_Color;  
    gl_Position = ftransform();
}
