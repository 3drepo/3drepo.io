vec4 x3dmain(in vec3 v_normal, in vec4 u_diffuse, in vec4 u_specular, in float u_shininess) {
    vec3 normal = normalize(v_normal);
    vec4 color = vec4(0., 0., 0., 0.);
    vec4 diffuse = vec4(0., 0., 1., 1.);
    vec4 specular;
    diffuse = u_diffuse;
    specular = u_specular;
    diffuse.xyz *= max(dot(normal,vec3(0.,0.,1.)), 0.);
    color.xyz += diffuse.xyz;
    color = vec4(color.rgb * diffuse.a, diffuse.a);
    return color;
}
