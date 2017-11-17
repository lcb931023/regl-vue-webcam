// import Vue from 'vue'
// import App from './App.vue'

// new Vue({
//   el: '#app',
//   render: h => h(App)
// })

const regl = require('regl')()

navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
  const video = document.createElement('video')
  video.src = window.URL.createObjectURL(stream)
  document.body.appendChild(video)
  video.style.display = 'none'
  video.addEventListener('loadedmetadata', () => {
    video.play()
    const webcam = regl.texture(video)
    const draw = regl({
      vert: `
      precision highp float;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = vec2(0.5 * (position.x + 1.0), 0.5 * (1.0 - position.y));
        gl_Position = vec4(position, 0, 1);
      }
      `,
    
      frag: `
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
     
      `,
    
      attributes: {
        position: [
          -4, 0,
          4, 4,
          4, -4
        ]
      },
    
      uniforms: {
        webcam
      },
    
      count: 3
    });
    regl.frame(() => {
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1
      })
      webcam.subimage(video)
      draw()
    })
  })
})

/**

      precision highp float;
      uniform sampler2D webcam;
      varying vec2 uv;
      void main () {
        gl_FragColor = texture2D(webcam, uv);
      }


 */