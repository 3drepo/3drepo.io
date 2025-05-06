varying vec2 id;

uniform sampler2D color_map;
uniform float maps_width;

void main() {
    vec2 uv = vec2(0, id.y / maps_width);
    vec4 mapTexel = texture2D(color_map, uv);
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}