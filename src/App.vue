<template>
  <div id="app">
    <div class="interface">
      <input type="range" min='-0.2' max='0.2' step='0.01' v-model='green_magenta'>
      <input type="range" min='-0.2' max='0.2' step='0.01' v-model='yellow_blue'>
    </div>
    <div class='container'ref="container"></div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      green_magenta: 0,
      yellow_blue: 0,
    }
  },
  mounted() {
    const createREGL = require('regl')

    const regl = createREGL(this.$refs.container);

    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
      const video = document.createElement('video')
      video.src = window.URL.createObjectURL(stream)
      // document.body.appendChild(video)
      // video.style.display = 'none'
      video.addEventListener('loadedmetadata', () => {
        video.play()
        const webcam = regl.texture(video)
        const drawCamFeed = regl({
          vert: require('./vert'),
          // frag: require('./pajama-pixels'),
          // frag: require('./zx-spectrum'),
          frag: require('./white-balance'),

          context: {
            resolution: function(context) { return [context.viewportWidth, context.viewportHeight] }
          },
        
          attributes: {
            position: [
              -4, 0,
              4, 4,
              4, -4
            ]
          },
        
          uniforms: {
            webcam,
            resolution: regl.context('resolution'),
            green_magenta: function (context, props) {
              return Number(props.green_magenta);
            },
            yellow_blue: function (context, props) {
              return Number(props.yellow_blue);
            },
          },
        
          count: 3
        });
        regl.frame(() => {
          regl.clear({
            color: [0, 0, 0, 1],
            depth: 1
          })
          webcam.subimage(video)
          drawCamFeed({
            green_magenta: this.green_magenta,
            yellow_blue: this.yellow_blue,
          });
        })
      })
    })
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  margin: 0;
  padding: 0;
  position: relative;
}
.interface {
  position: absolute;
  z-index: 2;
}
.container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}

</style>
