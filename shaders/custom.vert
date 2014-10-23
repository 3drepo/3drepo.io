attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoord;

uniform mat4 modelViewMatrix;
uniform mat4 modelViewMatrixInverse;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 normalMatrix;

varying vec3 fragNormal;
varying vec3 fragEyeVector;
varying vec2 fragTexCoord;

void main()
{
	fragEyeVector = -(modelViewMatrix * vec4(position, 0.0)).xyz;                                 
	//fragNormal    = (normalMatrix * vec4(normal, 0.0)).xyz;           
    fragNormal = normal;
    fragTexCoord = texcoord; 

	gl_Position   = modelViewProjectionMatrix * vec4(position, 1.0);
}
