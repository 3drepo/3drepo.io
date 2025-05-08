uniform float opacity;

uniform sampler2D depthNormals;
uniform sampler2D pick;

varying vec2 vUv;

void main() {
    vec4 d = texture2D( depthNormals, vUv );
    vec4 p = texture2D( pick, vUv);

    if((p.r + p.g + p.b + p.a) != 0.0) {
        if(d.a < -5.0){
            gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    }
    else {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 0.1);
    }
}