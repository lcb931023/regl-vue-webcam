const createREGL = require('regl');
/**
 * Takes care of getting user's camera stream,
 * displaying the stream on a video element,
 * and capturing a frame from the camera.
 */
const Camera = {
  /**
   * Request video stream,
   * load stream in video element,
   * and render video in webgl with shader applied.
   * Optionally place render in container.
   * @param {Object} constraints - MediaStreamConstraints.video. See https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints/video
   * @param {HTMLElement} [feedContainer] container div to display camera feed in
   * @returns {Promise<>}
   */
  turnOn(constraints, feedContainer) {
    if (!this.video) {
      this.video = document.createElement('video');
      this.video.autoplay = true;
    }
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      const gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true });
      this.regl = createREGL(gl);
    }
    // release resources before loading them again
    this.turnOff();
    if (feedContainer !== undefined) feedContainer.appendChild(this.canvas);
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: constraints,
    }).then((stream) => {
      // load stream into video element
      this.video.srcObject = stream;
      this.video.addEventListener('loadedmetadata', this.startREGL.bind(this), { once: true });
    });
  },
  /**
   * Callback for when video element's ready to display cam feed.
   * uses video element as texture,
   * and start regl render loop
   */
  startREGL() {
    // resize canvas to video size
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    const webcam = this.regl.texture(this.video);
    const drawCamFeed = this.regl({
      vert: require('./vert'),
      // frag: require('./pajama-pixels'),
      frag: require('./zx-spectrum'),
      // frag: require('./white-balance'),
      // frag: require('./normal-frag'),
      context: {
        resolution: function (context) { return [context.viewportWidth, context.viewportHeight] }
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
        resolution: this.regl.context('resolution'),
        // TODO add temperature and tint
      },
      count: 3,
    });
    this.regl.frame(() => {
      this.regl.clear({
        color: [0, 0, 0, 1],
        depth: 1,
      });
      webcam.subimage(this.video);
      // TODO pipe prop to drawing function
      drawCamFeed();
    });
  },
  /**
   * Capture a frame of current cam feed,
   * return frame as blob
   * @param {Object} [options] - capture dimension & quality option
   * @param {Number} options.width
   * @param {Number} options.height
   * @returns {Promise<Blob>} - A promise that contains the captured frame
   */
  capture({ width, height } = {}) {
    return new Promise((resolve, reject) => {
      // if cam feed unavailable, reject
      if (!this.canvas) {
        reject(new Error('Camera.canvas is undefined. Has Camera.turnOn() been called?'));
        return;
      }
      if (this.video.readyState === 0) {
        reject(new Error('video.readyState = 0. Camera has no video feed loaded.'));
        return;
      }
      // get dimension of video feed
      const w = width || this.video.videoWidth;
      const h = height || this.video.videoHeight;
      // render vid feed onto canvas
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = w;
      captureCanvas.height = h;
      const ctx = captureCanvas.getContext('2d');
      ctx.drawImage(this.canvas, 0, 0, w, h);
      // turn canvas to blob
      captureCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  },
  /**
   * Stop cam feed access
   * and stop its display in video element
   */
  turnOff() {
    // stop media track
    if (!this.video.srcObject) return;
    const stream = this.video.srcObject;
    stream.getVideoTracks().forEach((track) => {
      track.stop();
    });
    // clear reference to stream for garbage collection
    this.video.srcObject = null;
    // clear regl state and resources
    this.regl.destroy();
  },

  // TODO update regl props
  updateProp(prop, val) {
    console.log(prop, val)
  },
};

export default Camera;
