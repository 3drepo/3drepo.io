varying vec2 id;
varying vec2 tuv;

uniform sampler2D color_map;
uniform float maps_width;

#ifdef USE_COLOR_TEX
    uniform sampler2D color_tex;
#endif

void main() {
    float pixelSize = 1.0 / maps_width;
    vec2 muv = vec2((id.y / maps_width) + (pixelSize / 2.0), 0.5);
    vec4 c1 = texture2D(color_map, muv);
    #ifdef USE_COLOR_TEX
    vec4 c2 = texture2D(color_tex, tuv);
    c1 = c1 * c2;
    #endif
    gl_FragColor = c1;
}