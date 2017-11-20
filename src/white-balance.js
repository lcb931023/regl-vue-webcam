module.exports = `
precision highp float;
varying vec2 uv;
uniform sampler2D webcam;
uniform vec2 resolution;
uniform float green_magenta;
uniform float yellow_blue;

const vec3 green = vec3(0.0, 1.0, 0.0);
const vec3 magenta = vec3(1.0, 0.0, 1.0);
const vec3 yellow = vec3(1.0, 1.0, 0.0);
const vec3 blue = vec3(0.0, 0.0, 1.0);

void main()
{
  vec4 color = texture2D(webcam, uv);
  color.rgb = mix(color.rgb, green, vec3(green_magenta));
  color.rgb = mix(color.rgb, yellow, vec3(yellow_blue));
  color.rgb = mix(color.rgb, magenta, vec3(-green_magenta));
  color.rgb = mix(color.rgb, blue, vec3(-yellow_blue));
  gl_FragColor = color;
}
`