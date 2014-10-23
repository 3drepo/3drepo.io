//
// Fragment shader for Gooch shading
//
// Author: Randi Rost
//
// Copyright (c) 2002-2005 3Dlabs Inc. Ltd. 
//
// See 3Dlabs-License.txt for license information
//

varying float NdotL;
varying vec3  ReflectVec;
varying vec3  ViewVec;

uniform sampler2D tex;
uniform bool useTexture;

void main()
{
	vec3  WarmColor= vec3(0.4, 0.4, 0.0);
	vec3  CoolColor= vec3(0.0, 0.0, 1.0);
	float DiffuseWarm= 0.6;
	float DiffuseCool= 0.1;
	
    vec3 kcool    = min(CoolColor + DiffuseCool, 1.0);
    vec3 kwarm    = min(WarmColor + DiffuseWarm, 1.0); 
    vec3 kfinal   = mix(kcool, kwarm, NdotL);

    vec3 nreflect = normalize(ReflectVec);
    vec3 nview    = normalize(ViewVec);

    float spec    = max(dot(nreflect, nview), 0.0);
    spec          = pow(spec, 4.0);

	vec3 color;
	if (useTexture)
	{
		color = vec3(texture2D(tex, gl_TexCoord[0].xy));
	}
	else
	{
		color = gl_FrontMaterial.diffuse.rgb;
	}

    gl_FragColor = vec4(mix(min(kfinal + spec, 1.0), color, 0.6), gl_FrontMaterial.diffuse.a);}