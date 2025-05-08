varying vec2 id;
varying vec2 tuv;
varying vec3 worldPosition;

uniform sampler2D color_map;
uniform float maps_width;

uniform vec4 plane;

#ifdef USE_COLOR_TEX
    uniform sampler2D color_tex;
#endif

void main() {
    // Clipping
    if(plane.w != 0.0){
        float d = dot(plane.xyz, worldPosition);
        if (d < plane.w) {
            discard;
        }
    }

    float pixelSize = 1.0 / maps_width;
    vec2 muv = vec2((id.y / maps_width) + (pixelSize / 2.0), 0.5);
    vec4 c1 = texture2D(color_map, muv);
    #ifdef USE_COLOR_TEX
    vec4 c2 = texture2D(color_tex, tuv);
    c1 = c1 * c2;
    #endif
    gl_FragColor = vec4(plane.rgb, 1.0);
}