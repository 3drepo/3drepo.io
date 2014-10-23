varying vec3 normal, lightDir, I;
varying vec4 Cs;

void main()
{
    const float edgefalloff= 3.0;
    float intensity = max(dot(lightDir,normal),0.0); 
	
    vec4 color = vec4(gl_FrontMaterial.diffuse.r ,gl_FrontMaterial.diffuse.g ,gl_FrontMaterial.diffuse.b ,1.0) * Cs;

    float opac = dot(normal, normalize(I));
    opac = abs(opac) * gl_FrontMaterial.diffuse.a;
    opac = 1.0-pow(opac, edgefalloff);
    color.a=opac;
    gl_FragColor = color;
}
