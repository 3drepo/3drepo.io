attribute vec3 position;
attribute vec2 texcoord;

uniform mat4 modelViewProjectionMatrix;
varying vec2 fragTexCoord;

void main()
{
	vec2 pos = sign(position.xy);
	fragTexCoord = texcoord;
	gl_Position = vec4((pos.x + 1.0) / 2.0, pos.y, 0.0, 1.0);
}
