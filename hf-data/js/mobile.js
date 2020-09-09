let rendererCollect, cubeCollect, edgesCollect, sceneCollect, cameraCollect;

let rendererVisu, cubeVisu, edgesVisu, sceneVisu, cameraVisu;

let recordSelect, frequencyAccelerometer;

let cubeAlphaCollect = 0;
let cubeGammaCollect = 0;
let cubeBetaCollect = 0;

let cubeAlphaVisu = 0;
let cubeGammaVisu = 0;
let cubeBetaVisu = 0;

let recording = [];
let is_recording;
let is_showing;
let is_live;
let end_time_last_batch = new Date(0);
let recordingTimeout = [];

const samplingAccRate = 15;
/* Build mobile version */
function buildMobile() {
  let accelerometerCanvas = document.getElementById('accelerometer-canvas');
  [
    sceneCollect,
    cameraCollect,
    rendererCollect,
    cubeCollect,
    edgesCollect
  ] = create3DCanvas(accelerometerCanvas);
  animateCollect();

  let accelerometerButton = document.getElementById('accelerometer-button');
  accelerometerButton.addEventListener('click', startStopButton);

  let accelerometerVisuCanvas = document.getElementById('accelerometer-visualization-canvas');
  [sceneVisu, cameraVisu, rendererVisu, cubeVisu, edgesVisu] = create3DCanvas(
    accelerometerVisuCanvas
  );
  animateVisu();

  const accelerometerButtonShow = document.getElementById('accelerometer-show');
  accelerometerButtonShow.addEventListener('click', showRecording);

  frequencyAccelerometer = document.getElementById('frequency-accelerometer');
}

function startStopButton() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS 13+
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('deviceorientation', deviceorientation, false);
        }
        else {
          document.getElementById('container').style.display = 'none';
          alert('You have to grant the right over accelerometer to continue');
        }
      }).catch(console.error)
  } else {
    // non iOS 13+
    window.addEventListener('deviceorientation', deviceorientation, false);
  }

  if (!pryvHF.pryvConn) {
    alert('Please connect first to your Pryv account!');
    return;
  }
  const now = Date.now() / 1000;
  if (is_recording) {
    document.getElementById("accelerometer-button").innerHTML = 'Start Collect'
  } else {
    newEvent(pryvHF.pryvConn, true);
    document.getElementById("accelerometer-button").innerHTML = 'Stop Collect'
  }
  is_recording = !is_recording;

}

function deviceorientation(event) {
  if (is_recording) {
    const now = Date.now() / 1000;
    cubeAlphaCollect = THREE.Math.degToRad(event.alpha);
    cubeGammaCollect = THREE.Math.degToRad(event.gamma);
    cubeBetaCollect = THREE.Math.degToRad(event.beta);
    pryvHF.measures.orientationGamma.buffer.push([now, event.gamma]);
    pryvHF.measures.orientationBeta.buffer.push([now, event.beta]);
    pryvHF.measures.orientationAlpha.buffer.push([now, event.alpha]);
  }
}

function create3DCanvas(canvasProperty) {
  // Setting scene for 3D Object
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 0.5349182763744428, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvasProperty });

  const geometry = new THREE.BoxGeometry(3, 1.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  let edges = new THREE.EdgesGeometry(geometry);
  edges = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x0000ff })
  );
  scene.add(edges);
  camera.position.z = 5;
  return [scene, camera, renderer, cube, edges];
}

function animateCollect() {
  requestAnimationFrame(animateCollect);
  edgesCollect.rotation.x = cubeBetaCollect;
  edgesCollect.rotation.y = cubeGammaCollect;
  edgesCollect.rotation.z = cubeAlphaCollect;
  cubeCollect.rotation.x = cubeBetaCollect;
  cubeCollect.rotation.y = cubeGammaCollect;
  cubeCollect.rotation.z = cubeAlphaCollect;
  rendererCollect.render(sceneCollect, cameraCollect);
}

function animateVisu() {
  requestAnimationFrame(animateVisu);
  edgesVisu.rotation.x = cubeBetaVisu;
  edgesVisu.rotation.y = cubeGammaVisu;
  edgesVisu.rotation.z = cubeAlphaVisu;
  cubeVisu.rotation.x = cubeBetaVisu;
  cubeVisu.rotation.y = cubeGammaVisu;
  cubeVisu.rotation.z = cubeAlphaVisu;
  rendererVisu.render(sceneVisu, cameraVisu);
}

function recordAccelerometer(pointsAlpha, pointsBeta, pointsGamma, l) {
  let now = new Date();
  let diff = end_time_last_batch - now;
  diff = diff > 0 ? diff:0;
  end_time_last_batch = new Date(now.getTime() + diff + samplingAccRate * l);
  for (let i = 0; i < l; i++) {
    recording.push([pointsAlpha[i], pointsBeta[i], pointsGamma[i]]);
    if (is_live) {
      time = (diff + samplingAccRate * i);
      recordingTimeout[i] = setTimeout(() => {
        cubeAlphaVisu = pointsAlpha[i];
        cubeBetaVisu = pointsBeta[i];
        cubeGammaVisu = pointsGamma[i];
      }, time);
    }
  }
}

function showRecording() {
  is_live = false;
  let time = 0;
  if (!is_showing) {
    is_showing = true;
    for (let i = 0; i < recording.length; i++) {
      let point = recording[i];
      time = samplingAccRate * i;
      recordingTimeout[i] = setTimeout(() => {
        cubeAlphaVisu = point[0];
        cubeBetaVisu = point[1];
        cubeGammaVisu = point[2];
      }, time);
    }
    // Wait until the end of the recording before being able to run another.
    setTimeout(() => {
      is_showing = false;
    }, samplingAccRate * recording.length);
  }
}

function emptyRecordingBuffer() {
  for (let i = 0; i < recordingTimeout.length; ++i) {
    clearTimeout(recordingTimeout[i]);
  }
}