varying vec2 id;
varying vec3 worldPosition;
varying vec3 worldNormal;
varying vec3 viewPosition;

uniform sampler2D pick_map;
uniform float maps_width;

void main() {
    gl_FragColor = vec4(
        worldNormal.xyz,
        viewPosition.z
    );
}