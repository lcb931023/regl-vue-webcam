module.exports = `
#define PI 3.14159265
#define SCALE 100.
#define RATIO 1.5
#define BRIGHTNESS 1.
#define SHAPE 2.5
precision highp float;
varying vec2 uv;
uniform sampler2D webcam;
vec4 pixelate(sampler2D tex, vec2 uv, float scale, float ratio)
{
  float ds = 1.0 / scale;
  vec2 coord = vec2(ds * ceil(uv.x / ds), (ds * ratio) * ceil(uv.y / ds / ratio));
  return vec4(texture2D(tex, coord).xyzw);
}
void main()
{
  vec4 color = pixelate(webcam, uv, SCALE, RATIO) * BRIGHTNESS;
  vec2 coord = uv * vec2(SCALE, SCALE / RATIO);
  vec2 mv = abs(sin(coord * PI)) * SHAPE;
  float s = mv.x * mv.y;
  float c = step(s, 1.0);
  color = ((1. - c) * color) + ((color * s) * c);
  gl_FragColor = color;
}

`