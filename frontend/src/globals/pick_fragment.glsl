varying vec2 id;

uniform sampler2D pick_map;
uniform float maps_width;

void main() {
    float pixelSize = 1.0 / maps_width;
    vec2 muv = vec2((id.y / maps_width) + (pixelSize / 2.0), 0.5);
    vec4 c1 = texture2D(pick_map, muv);
    gl_FragColor = c1;
}