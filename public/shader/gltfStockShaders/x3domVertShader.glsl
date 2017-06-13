vec4 x3dmain(
in vec3 position,
in vec3 normal,
inout vec3 v_normal,
in mat4 normalMatrix,
in mat4 modelViewMatrix,
in mat4 projectionMatrix)
{
    vec4 pos = modelViewMatrix * vec4(position,1.0);
    v_normal = (normalMatrix * vec4(normal, 0.0)).xyz;
    return projectionMatrix * pos;
}
