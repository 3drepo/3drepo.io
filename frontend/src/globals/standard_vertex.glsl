varying vec2 id;
varying vec2 tuv;
varying vec3 worldPosition;
varying vec3 worldNormal;
varying vec3 viewPosition;

attribute vec2 uv0;
attribute vec2 uv1;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  tuv = uv0;
  id = uv1;
  worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  worldNormal = (modelMatrix * vec4(normal, 0.0)).xyz;  // We assume uniform scaling always
  viewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
}