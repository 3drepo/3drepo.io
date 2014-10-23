
varying vec3 Normal;
varying vec3 LightDir;

uniform sampler2D tex;
uniform bool useTexture;

void main (void)
{
	float lim1= 0.96;
	float lim2= 0.8;
	float lim3= 0.4;
	vec3 color;
	if (useTexture)
	{
		color = vec3(texture2D(tex, gl_TexCoord[0].xy));
	}
	else
	{
		color = gl_FrontMaterial.diffuse.rgb;
	}
	vec3 specularColor= gl_FrontMaterial.specular.rgb;
	vec3 mixColor=mix(color, specularColor,0.3);
	float f = dot(LightDir,Normal);
	
	vec3 satColor = vec3(1.0,1.0,1.0);
	//vec3 satColor = mix(vec3(1.0,1.0,1.0), gl_FrontMaterial.specular.rgb, 0.5);
	if (f > lim1) {
		color=mix(mixColor,satColor,0.8);
	}
	else if (f > lim2)
	{
		color=mix(color, satColor,0.1);
	}
	else if (f < lim3)
	{
		color= mix(color, vec3(0.0, 0.0, 0.0), 0.8);
	}
	else
	{
		color= mix(color, vec3(0.0, 0.0, 0.0), 0.1);
	}
	
	gl_FragColor = vec4(color, gl_FrontMaterial.diffuse.a);
}
