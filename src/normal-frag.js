module.exports = `
precision highp float;
varying vec2 uv;
uniform sampler2D webcam;
uniform vec2 resolution;

void main()
{
  vec4 color = texture2D(webcam, uv);
  gl_FragColor = color;
}
`