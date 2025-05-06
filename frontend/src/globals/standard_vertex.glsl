varying vec2 id;
varying vec2 tuv;

attribute vec2 uv0;
attribute vec2 uv1;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  tuv = uv0;
  id = uv1;
}