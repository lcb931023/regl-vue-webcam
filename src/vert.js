module.exports = `
precision highp float;
attribute vec2 position;
varying vec2 uv;
void main () {
  uv = vec2(0.5 * (position.x + 1.0), 0.5 * (1.0 - position.y));
  gl_Position = vec4(position, 0, 1);
}
`