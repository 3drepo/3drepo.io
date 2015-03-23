#ifdef GL_ES
	precision highp float;
#endif
				
uniform sampler2D tex;
varying vec2 fragTexCoord;

void main()
{
	vec3 col = texture2D(tex, fragTexCoord).rgb;
	gl_FragColor = vec4(col, 1.0);
}

