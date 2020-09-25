let serviceInfo, service, serviceInfoSelect, serviceInfoInput;

const pryvHF = {
  pryvConn: null,
  measures: {
    mouseX: {
      event: null,
      buffer: []
    },
    mouseY: {
      event: null,
      buffer: []
    },
    orientationGamma: {
      event: null,
      buffer: []
    },
    orientationBeta: {
      event: null,
      buffer: []
    },
    orientationAlpha: {
      event: null,
      buffer: []
    }
  }
};

let SAMPLE_POST_MS = 100;
let DELAY_IF_EMPTY_BATCH_MS = 1000;
let length_last_batch;

let pointsSecondMouse = 0;
let pointsSecondAccelerometer = 0;

let countError = 0;

let fromTime = 0;

function buildServiceInfo() {
  document.getElementById('service').style.display = '';
  serviceInfoSelect = document.getElementById('service-info-select');
  serviceInfoInput = document.getElementById('service-info-text');
  serviceInfoSelect.addEventListener('change', setServiceInfo);
  document
    .getElementById('fetch-service-info-button')
    .addEventListener('click', fetchServiceInfo);
}

function setServiceInfo() {
  const selection = document.getElementById('service-info-select').value;
  serviceInfoInput.value = selection;
}

async function fetchServiceInfo() {
  service = new Pryv.Service(serviceInfoInput.value);
  serviceInfo = await service.info();
  performAuthRequest();
}

async function performAuthRequest() {
  const authSettings = {
    spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: {
      // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: 'app-web-hfdemo', // to customize for your own app
      requestedPermissions: [
        {
          streamId: 'hf',
          defaultName: 'HF',
          level: 'manage' // permission for the app to manage data in the stream 'HF'
        }
      ],
      requestingAppId: 'app-web-hfdemo'
    }
  };

  Pryv.Browser.setupAuth(authSettings, serviceInfoInput.value);
}

async function pryvAuthStateChange(state) {
  // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    console.log(state);
    let connection = new Pryv.Connection(state.apiEndpoint);
    showCollectAndVisualize(true);
    await setupStreamStructure(connection);
    updateSharings();
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    pryvHF.pryvConn = null;
    connection = null;
    showCollectAndVisualize(false);
  }
}

/* Show collection and visualization div when the user is connected */
function showCollectAndVisualize(isDisplay) {
  let display = isDisplay ? '' : 'none';
  if (isMobile) {
    document.getElementById('accelerometer-collect').style.display = display;
    document.getElementById('accelerometer-visualization').style.display = display;
  } else {
    document.getElementById('mouse-tracker').style.display = display;
    document.getElementById('mouse-visualization').style.display = display;
  }
  document.getElementById('sharing-view').style.display = display;
}

async function setupStreamStructure(connection) {
  // retrieve existing streams structure
  const resultHandlers = [];
  const apiCalls = [];
  const streams = (await connection.get('streams', null)).streams;
  const [hasRootStream, hasDesktopStream, hasMobileStream] = hasStreams(
    streams
  );
  // create necessary streams
  if (!hasRootStream) {
    apiCalls.push({
      method: 'streams.create',
      params: {
        id: 'hfdemo',
        name: 'HF Demo',
        parentId: 'hf'
      }
    });
    resultHandlers.push(null);
    executeCalls(connection, apiCalls, resultHandlers, false);
  }
  if (isMobile) {
    /* If streams for mobile devices do not exist */
    if (!hasMobileStream) {
      await newStream(connection, true);
    }
    // await newEvent(connection, true)
  } else {
    if (!hasDesktopStream) {
      await newStream(connection, false);
    }
    // await newEvent(connection, false);
  }
  pryvHF.pryvConn = connection;

  /**
   * @returns hasRootStream: True if streams hfdemo exists
   * @returns hasDesktopStream: True if streams for desktop devices exist
   * @returns hasMobileStream: True if streams for mobile devices exist
   */
  function hasStreams(streams) {
    let hasDesktopStream = false;
    let hasMobileStream = false;
    let hasRootStream = false;
    if (streams.length == 0) {
      return [hasRootStream, hasDesktopStream, hasMobileStream];
    }
    streams = streams[0].children.filter(x => x.id == 'hfdemo');
    if (streams.length == 0) {
      return [hasRootStream, hasDesktopStream, hasMobileStream];
    }
    hasRootStream = true;
    hasDesktopStream = streams[0].children.filter(x => x.name == 'Mouse-X')
      .length;
    hasMobileStream = streams[0].children.filter(
      x => x.name == 'Orientation-Alpha'
    ).length;
    return [hasRootStream, hasDesktopStream, hasMobileStream];
  }
}

async function executeCalls(connection, apiCalls, resultHandlers, isCreatingEvent) {
  try {
    const results = await connection.api(apiCalls);
    console.log('...structure created: ', results);
    for (let i = 0; i < results.length; i++) {
      if (resultHandlers[i]) {
        /* If no new event is created => error with token */
        if (isCreatingEvent && results[i].event == null) {
          throw new Error(
            "The given token's access permissions do not allow to create an event. Please suppress the app access before reconnecting"
          );
        }
        resultHandlers[i].call(null, results[i]);
      }
    }
  }
  catch (error) {
    console.error('...error: ', error);
    alert(error);
    showCollectAndVisualize(false);
  }
}

async function newStream(connection, isMobile) {
  const apiCalls = [];
  const resultHandlers = [];
  if (isMobile) {
    apiCalls.push(
      // Accelerometer
      {
        method: 'streams.create',
        params: {
          id: 'hfdemo-orientation-gamma',
          name: 'Orientation-Gamma',
          parentId: 'hfdemo',
          clientData: buildPlotlyOptions('Orientation', 'angle/deg', 'Gamma')
        }
      },
      {
        method: 'streams.create',
        params: {
          id: 'hfdemo-orientation-beta',
          name: 'Orientation-Beta',
          parentId: 'hfdemo',
          clientData: buildPlotlyOptions('Orientation', 'angle/deg', 'Beta')
        }
      },
      {
        method: 'streams.create',
        params: {
          id: 'hfdemo-orientation-alpha',
          name: 'Orientation-Alpha',
          parentId: 'hfdemo',
          clientData: buildPlotlyOptions('Orientation', 'angle/deg', 'Alpha')
        }
      }
    );
    resultHandlers.push(null, null, null, null, null, null);
  }
  else {
    apiCalls.push(
      // MOUSE
      {
        method: 'streams.create',
        params: {
          id: 'hfdemo-mouse-x',
          name: 'Mouse-X',
          parentId: 'hfdemo',
          clientData: buildPlotlyOptions('Mouse', 'count/generic', 'X')
        }
      },
      {
        method: 'streams.create',
        params: {
          id: 'hfdemo-mouse-y',
          name: 'Mouse-Y',
          parentId: 'hfdemo',
          clientData: buildPlotlyOptions('Mouse', 'count/generic', 'Y')
        }
      }
    );

    resultHandlers.push(null, null, null, null);
  }
  await executeCalls(connection, apiCalls, resultHandlers, false);
}

async function newEvent(connection, isMobile) {
  // Can be good to add generic tuple types for the event (1 event instead of 2-3). 
  const apiCalls = [];
  const resultHandlers = [];
  if (isMobile) {
    apiCalls.push(
      {
        method: 'events.create',
        params: {
          streamId: 'hfdemo-orientation-gamma',
          type: 'series:angle/deg',
          description: 'Holder for device gamma'
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: 'hfdemo-orientation-beta',
          type: 'series:angle/deg',
          description: 'Holder for device beta'
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: 'hfdemo-orientation-alpha',
          type: 'series:angle/deg',
          description: 'Holder for device alpha'
        }
      }
    );
    // https://github.com/pryv/lib-js#advanced-usage-of-api-calls-with-optional-individual-result-and-progress-callbacks
    resultHandlers.push(
      function handleCreateEventGamma(result) {
        pryvHF.measures.orientationGamma.event = result.event;
        console.log('handle gammaEvent set', result.event);
      },
      function handleCreateEventBeta(result) {
        pryvHF.measures.orientationBeta.event = result.event;
        console.log('handle betaEvent set', result.event);
      },
      function handleCreateEventAlpha(result) {
        pryvHF.measures.orientationAlpha.event = result.event;
        console.log('handle alphaEvent set', result.event);
      }
    );
  }
  else {
    apiCalls.push(
      {
        method: 'events.create',
        params: {
          streamId: 'hfdemo-mouse-x',
          type: 'series:count/generic',
          description: 'Holder for x mouse position'
        }
      },
      {
        method: 'events.create',
        params: {
          streamId: 'hfdemo-mouse-y',
          type: 'series:count/generic',
          description: 'Holder for y mouse position'
        }
      }
    );
    // https://github.com/pryv/lib-js#advanced-usage-of-api-calls-with-optional-individual-result-and-progress-callbacks
    resultHandlers.push(
      function registerEventX(result) {
        pryvHF.measures.mouseX.event = result.event;
        console.log('handle xEvent set', result.event);
      },
      function registerEventY(result) {
        pryvHF.measures.mouseY.event = result.event;
        console.log('handle yEvent set', result.event);
      }
    );
  }
  await executeCalls(connection, apiCalls, resultHandlers, true);
}

async function deleteCurrentEvent() {
  const apiCalls = [];
  const resultHandlers = [];
  if (!pryvHF.measures.mouseX.event && !pryvHF.measures.orientationAlpha.event) {
    alert('No event to delete');
  }
  else {
    const confirmation = confirm('Are you sure to delete the current event?');
    if (confirmation) {
      if (pryvHF.measures.mouseX.event) {
        apiCalls.push(
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.mouseX.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.mouseX.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.mouseY.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.mouseY.event.id
            }
          }
        );
        resultHandlers.push(
          function deleteEventX() {
            pryvHF.measures.mouseX.event = null;
          },
          function confirmDeletionEventX(result) {
            console.log('deletion xEvent', result);
          },
          function registerEventY() {
            pryvHF.measures.mouseY.event = null;
          },
          function confirmDeletionEventY(result) {
            console.log('deletion yEvent', result);
          }
        );
        clearCtx(renderCtx);
        clearCtx(drawingCtx)
        if (is_recording) {
          mouseDown();
        }
      }
      else {
        apiCalls.push(
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationAlpha.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationAlpha.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationBeta.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationBeta.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationGamma.event.id
            }
          },
          {
            method: 'events.delete',
            params: {
              id: pryvHF.measures.orientationGamma.event.id
            }
          }
        );
        resultHandlers.push(
          function deleteEventAlpha() {
            pryvHF.measures.orientationAlpha.event = null;
          },
          function confirmDeletionEventAlpha(result) {
            console.log('deletion alphaEvent', result);
          },
          function registerEventBeta() {
            pryvHF.measures.orientationBeta.event = null;
          },
          function confirmDeletionEventBeta(result) {
            console.log('deletion betaEvent', result);
          },
          function registerEventGamma() {
            pryvHF.measures.orientationGamma.event = null;
          },
          function confirmDeletionEventGamma(result) {
            console.log('deletion gammaEvent', result);
          }
        );
      }
      await executeCalls(pryvHF.pryvConn, apiCalls, resultHandlers, false);
      if (is_recording) {
        startStopButton();
      }
    }
  }
}

// used for https://github.com/pryv/app-web-plotly
function buildPlotlyOptions(key, type, name) {
  let data = {};
  data[type] = {
    plotKey: key,
    trace: {
      type: 'scatter',
      name: name,
      mode: 'lines',
      connectgaps: 0
    }
  };
  return { 'app-web-plotly': data };
}

/* Post the HF data every SAMPLE_POST_MS */
function savePoints() {
  if (pryvHF.pryvConn) {
    sendHfPoints(pryvHF.pryvConn, pryvHF.measures);
  }
  setTimeout(savePoints, SAMPLE_POST_MS);
}

function sendHfPoints(connection, measures) {
  for (let key in measures) {
    let bufferLength = measures[key].buffer.length;
    if (measures[key].event && bufferLength > 0) {
      let points = measures[key].buffer;
      connection.addPointsToHFEvent(
        measures[key].event.id,
        measures[key].event.content.fields,
        points
      );
      // Reset local buffer
      measures[key].buffer = [];
    }
  }
}

/* Pull info from Pryv */
async function fetchPoints() {
  if (pryvHF.pryvConn) {
    length_last_batch = 0;
    if (pryvHF.measures.mouseX.event) {
      await fetchSerieMouse();
    }
    if (pryvHF.measures.orientationGamma.event) {
      await fetchSerieAccelerometer();
    }
  }
  if (length_last_batch) {
    fetchPoints();
  } else {
    setTimeout(fetchPoints, DELAY_IF_EMPTY_BATCH_MS);
  }
}

async function fetchSerieMouse() {
  let queryParams = {
    fromDeltaTime: fromTime + 0.0001
  };
  let pathX = 'events/' + pryvHF.measures.mouseX.event.id + '/series';
  let pathY = 'events/' + pryvHF.measures.mouseY.event.id + '/series';
  let resultX = pryvHF.pryvConn.get(pathX, queryParams);
  let resultY = pryvHF.pryvConn.get(pathY, queryParams);
  try {
    await Promise.all([resultX, resultY]).then(([pointsX, pointsY]) => {
      let l = Math.min(pointsX.points.length, pointsY.points.length);
      length_last_batch += l;
      pointsSecondMouse += l;
      let lastValue = pointsX.points[l - 1];
      if (lastValue) {
        fromTime = pointsX.points[l - 1][0];
        draw(pointsX.points, pointsY.points, l);
      }
    });
    countError = 0
  } catch (error) {
    // To avoid crash after deleting event, due to fetch order just after deletion
    if (countError > 0) {
      container.style.display = 'none';
      alert('Error to fetch data');
    }
    countError += 1;
  }
}

async function fetchSerieAccelerometer() {
  let queryParams = {
    fromDeltaTime: fromTime + 0.0001
  };
  let pathGamma =
    'events/' + pryvHF.measures.orientationGamma.event.id + '/series';
  let pathBeta =
    'events/' + pryvHF.measures.orientationBeta.event.id + '/series';
  let pathAlpha =
    'events/' + pryvHF.measures.orientationAlpha.event.id + '/series';
  let resultGamma = pryvHF.pryvConn.get(pathGamma, queryParams);
  let resultBeta = pryvHF.pryvConn.get(pathBeta, queryParams);
  let resultAlpha = pryvHF.pryvConn.get(pathAlpha, queryParams);
  try {
    await Promise.all([resultGamma, resultBeta, resultAlpha]).then(
      ([pointsGamma, pointsBeta, pointsAlpha]) => {
        let l = Math.min(
          pointsGamma.points.length,
          pointsBeta.points.length,
          pointsAlpha.points.length
        );
        length_last_batch += l;
        pointsSecondAccelerometer += l;
        if (l) {
          fromTime = pointsGamma.points[l - 1][0];
          pointsGamma = pointsGamma.points.map(([timestamp, x]) => {
            return THREE.Math.degToRad(x);
          });
          pointsBeta = pointsBeta.points.map(([timestamp, x]) => {
            return THREE.Math.degToRad(x);
          });
          pointsAlpha = pointsAlpha.points.map(([timestamp, x]) => {
            return THREE.Math.degToRad(x);
          });
          recordAccelerometer(pointsAlpha, pointsBeta, pointsGamma, l);
        }
      }
    );
    countError = 0;

  } catch (error) {
    // To avoid crash after deleting event, due to fetch order just after deletion
    if (countError > 0) {
      container.style.display = 'none';
      alert('Error to fetch data');
    }
    countError += 1;
  }
}

/* Calculate the number of points fetched per second */
function computeFrequency() {
  if (pryvHF.pryvConn) {
    if (pryvHF.measures.mouseX.event) {
      frequencyMouse.innerHTML =
        'Data points rate: ' + pointsSecondMouse + ' NUM/s';
    }
    if (pryvHF.measures.orientationGamma.event) {
      frequencyAccelerometer.innerHTML =
        'Data points rate: ' + pointsSecondAccelerometer + ' NUM/s';
    }
    pointsSecondMouse = 0;
    pointsSecondAccelerometer = 0;
  }
  setTimeout(computeFrequency, 1000);
}
