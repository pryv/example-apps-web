let rendererCollect, cubeCollect, edgesCollect, sceneCollect, cameraCollect;

let rendererVisu, cubeVisu, edgesVisu, sceneVisu, cameraVisu;

let accelerometerRecordCounter, recordSelect, frequencyAccelerometer;

let cubeAlphaCollect = 0;
let cubeGammaCollect = 0;
let cubeBetaCollect = 0;

let cubeAlphaVisu = 0;
let cubeGammaVisu = 0;
let cubeBetaVisu = 0;

let currentRecording = [];
let is_recording;
let recordings = [];
let is_showing;

const samplingAccRate = 30;
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
  accelerometerButton.addEventListener('click', samplingButton);

  window.addEventListener('deviceorientation', deviceorientation, false);

  let accelerometerVisuCanvas = document.getElementById(
    'accelerometer-visualization-canvas'
  );
  [sceneVisu, cameraVisu, rendererVisu, cubeVisu, edgesVisu] = create3DCanvas(
    accelerometerVisuCanvas
  );
  animateVisu();

  accelerometerRecordCounter = document.getElementById('counter-accelerometer');
  const accelerometerButtonShow = document.getElementById('accelerometer-show');
  accelerometerButtonShow.addEventListener('click', showRecording);

  recordSelect = document.getElementById('recording-select');

  frequencyAccelerometer = document.getElementById('frequency-accelerometer');
}

function samplingButton(e) {
  if (!pryvHF.pryvConn) {
    alert('Please connect first to your Pryv account!');
    return;
  }
  const now = Date.now() / 1000;
  if (is_recording) {
    //Add point to indicate the end of a drawing
    pryvHF.measures.orientationGamma.buffer.push([now, IMAGE_END]);
    pryvHF.measures.orientationBeta.buffer.push([now, IMAGE_END]);
    pryvHF.measures.orientationAlpha.buffer.push([now, IMAGE_END]);
  } else {
    //Add point to indicate the beggining of a drawing
    pryvHF.measures.orientationGamma.buffer.push([now, IMAGE_START]);
    pryvHF.measures.orientationBeta.buffer.push([now, IMAGE_START]);
    pryvHF.measures.orientationAlpha.buffer.push([now, IMAGE_START]);
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
  for (let i = 0; i < l; i++) {
    if (pointsAlpha[i] != IMAGE_START && pointsAlpha[i] != IMAGE_END) {
      currentRecording.push([pointsAlpha[i], pointsBeta[i], pointsGamma[i]]);
    } else if (pointsAlpha[i] == IMAGE_START) {
      currentRecording = [];
    } else if (pointsAlpha[i] == IMAGE_END) {
      //Add option to the select
      const index = recordings.length;
      const opt = document.createElement('option');
      opt.appendChild(document.createTextNode('Recording ' + index));
      opt.value = index;
      recordSelect.appendChild(opt);

      // Push new recording in images
      recordings.push(currentRecording);
      accelerometerRecordCounter.innerHTML =
        'Number of stored recordings: ' + recordings.length;
    }
  }
}

function showRecording() {
  const selected = recordSelect.value;
  if (selected == '') {
    alert('No recording available');
    return;
  }
  let time = 0;
  const recording = recordings[selected];
  if (!is_showing) {
    is_showing = true;
    for (let i = 0; i < recording.length; i++) {
      let point = recording[i];
      time = samplingAccRate * i;
      setTimeout(() => {
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
