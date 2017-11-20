module.exports = `
precision highp float;
varying vec2 uv;
uniform sampler2D webcam;
uniform vec2 resolution;

struct transfer {
	float power;
	float off;
	float slope;
	float cutoffToLinear;
	float cutoffToGamma;
	bool tvRange;
};

struct rgb_space {
	mat3 primaries;
	vec3 whitePoint;
	transfer trc;
};

const mat3 primaries709 = mat3(
	0.64, 0.33, 0.03,
	0.3, 0.6, 0.1,
	0.15, 0.06, 0.79
);

const vec3 whiteD65 = vec3(0.312713, 0.329016, 0.358271);

const transfer gamSrgb = transfer(2.4, 0.055, 12.92, 0.04045, 0.0031308, false);

const rgb_space Srgb = rgb_space(primaries709, whiteD65, gamSrgb);


mat3 diag(vec3 scalars)
{
	return mat3(
		scalars.r, 0.0, 0.0,
		0.0, scalars.g, 0.0,
		0.0, 0.0, scalars.b
	);
}

mat3 conversionMatrix(rgb_space from, rgb_space to)
{
	vec3 fromWhite = from.whitePoint/from.whitePoint.y;
	vec3 toWhite = to.whitePoint/to.whitePoint.y;

  // NOTE inverse doesn't exist in webgl. 
  // implement yourself or find a way to skip using it
	vec3 fromScalars = inverse(from.primaries)*fromWhite;
	mat3 fromRGB = from.primaries*diag(fromScalars);

	vec3 toScalars = inverse(to.primaries)*toWhite;
	mat3 toRGB = inverse(to.primaries*diag(toScalars));

	return toRGB*fromRGB;
}

vec4 toLinear(vec4 color, transfer trc)
{
	if (trc.tvRange) {
		color = color*85.0/73.0 - 16.0/219.0;
	}

	bvec4 cutoff = lessThan(color, vec4(trc.cutoffToLinear));
	bvec4 negCutoff = lessThanEqual(color, vec4(-1.0*trc.cutoffToLinear));
	vec4 higher = pow((color + trc.off)/(1.0 + trc.off), vec4(trc.power));
	vec4 lower = color/trc.slope;
	vec4 neg = -1.0*pow((color - trc.off)/(-1.0 - trc.off), vec4(trc.power));

	color = mix(higher, lower, cutoff);
	color = mix(color, neg, negCutoff);

	return color;
}

vec4 toGamma(vec4 color, transfer trc)
{
	bvec4 cutoff = lessThan(color, vec4(trc.cutoffToGamma));
	bvec4 negCutoff = lessThanEqual(color, vec4(-1.0*trc.cutoffToGamma));
	vec4 higher = (1.0 + trc.off)*pow(color, vec4(1.0/trc.power)) - trc.off;
	vec4 lower = color*trc.slope;
	vec4 neg = (-1.0 - trc.off)*pow(-1.0*color, vec4(1.0/trc.power)) + trc.off;

	color = mix(higher, lower, cutoff);
	color = mix(color, neg, negCutoff);

	if (trc.tvRange) {
		color = color*73.0/85.0 + 16.0/255.0;
	}

	return color;
}

// Converts from one RGB colorspace to another, output as linear light
vec4 convert(vec4 color, rgb_space from, rgb_space to)
{
	mat3 convert = conversionMatrix(from, to);

	color = toLinear(color, from.trc);
	color.rgb = convert*color.rgb;

	return color;
}


void main(  )
{
	// Change these to change what colorspace is being converted from/to
	rgb_space from = Srgb;
	rgb_space to = Srgb;
	// from.whitePoint.xy += (iMouse.xy - abs(iMouse.zw))/resolution.xy/3.0;
	from.whitePoint.xy += vec2(400., 400.)/resolution.xy/3.0;
	from.whitePoint.z = 1.0 - from.whitePoint.x - from.whitePoint.y;

	vec2 texRes = vec2(textureSize(webcam, 0));
	vec2 texCoord = (gl_FragCoord - 0.5)/texRes;
	texCoord *= texRes.x/resolution.x;

	bool left = bool(int(texCoord.x*2.0));

	if (!left) {
		from = Srgb;
		to = from;
	}

	vec4 color = convert(texture2D(webcam, texCoord), from, to);

	gl_FragColor = toGamma(color, to.trc);
}
`