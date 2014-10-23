//
// Vertex shader for Gooch shading
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

void main()
{
	gl_TexCoord[0]= gl_MultiTexCoord0;
	vec3 LightPosition= gl_LightSource[0].position.xyz;
    vec3 ecPos      = vec3(gl_ModelViewMatrix * gl_Vertex);
    gl_ClipVertex	= gl_ModelViewMatrix * gl_Vertex;
    vec3 tnorm      = normalize(gl_NormalMatrix * gl_Normal);
    vec3 lightVec   = normalize(LightPosition - ecPos);
    ReflectVec      = normalize(reflect(-lightVec, tnorm));
    ViewVec         = normalize(-ecPos);
    NdotL           = (dot(lightVec, tnorm) + 1.0) * 0.4;
    gl_Position     = ftransform();
}