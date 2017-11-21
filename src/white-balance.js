module.exports = `
precision highp float;
varying vec2 uv;
uniform sampler2D webcam;
uniform vec2 resolution;
uniform float tint;
uniform float temperature;

const vec3 green = vec3(0.0, 1.0, 0.0);
const vec3 magenta = vec3(1.0, 0.0, 1.0);
const vec3 yellow = vec3(1.0, 1.0, 0.0);
const vec3 blue = vec3(0.0, 0.0, 1.0);

void main()
{
  vec4 color = texture2D(webcam, uv);
  color.rgb = mix(color.rgb, green, vec3(tint));
  color.rgb = mix(color.rgb, yellow, vec3(temperature));
  color.rgb = mix(color.rgb, magenta, vec3(-tint));
  color.rgb = mix(color.rgb, blue, vec3(-temperature));
  gl_FragColor = color;
}
`