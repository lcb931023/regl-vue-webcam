<template>
  <div class="screen-camera">
    <div ref='feedContainer' class="feed-container"></div>
    <div class="ui" ref='ui'>
      <h1>Camera</h1>
      <button @click='capture'>Capture</button>
      <button @click='turnOff'>Turn Off</button>
      <button @click='turnOn'>Turn On</button>
    </div>
  </div>
</template>

<script>
import Cam from './camera';

export default {
  name: 'Camera',
  data() {
    return {
      temperature: 0, // blue to yellow
      tint: 0, // green to magenta
    };
  },
  watch: {
    temperature(val) {
      Cam.updateProp('temperature', val);
    },
    tint(val) {
      Cam.updateProp('tint', val);
    },
  },
  mounted() {
    // start accessing camera feed
    Cam.turnOn({
      width: 1280,
      height: 720,
      facingMode: 'user',
    }, this.$refs.feedContainer)
    .then(() => {
      // ???
    })
    .catch((err) => {
      this.$refs.feedContainer.innerText = `${err.name}: ${err.message}`;
    });
  },
  beforeDestroy() {
    // stop cam feed
    Cam.turnOff();
  },
  methods: {
    capture() {
      return Cam.capture({ width: 320, height: 180 }).then((blob) => {
        // store blob in vuex
        // DEBUG display
        const img = document.createElement('img');
        const blobUrl = URL.createObjectURL(blob);
        // release memory once img finishes loading blobUrl
        img.onload = () => {
          URL.revokeObjectURL(blobUrl);
        };
        img.src = blobUrl;
        this.$refs.ui.appendChild(img);
      }).catch((err) => {
        // TODO log error with crow
        throw err;
      });
    },
    turnOff() {
      Cam.turnOff();
    },
    turnOn() {
      Cam.turnOn({
        width: 1280,
        height: 720,
        facingMode: 'user',
      }, this.$refs.feedContainer);
    },
  },
};
</script>

<style scoped>
.ui {
  position: absolute;
  margin: 0 auto;
  left: 0;
  right: 0;
  z-index: 2;
}
.feed-container, .flasher {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.feed-container >>> canvas {
  width: auto;
  max-width: 100%;
}
</style>
