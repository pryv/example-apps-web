let serviceInfo, service;

let pryvHF = {
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

let samplePostMs = 100;
let delayIfEmptyBatch = 1000;
let length_last_batch;

let pointsSecondMouse = 0;
let pointsSecondAccelerometer = 0;

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
  authRequest();
}

async function authRequest() {
  Pryv.Browser.setupAuth(authSettings, serviceInfoInput.value);
}

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
        level: 'manage' // permission for the app to manage data in the stream 'Health'
      }
    ],
    requestingAppId: 'app-web-hfdemo'
  }
};

async function pryvAuthStateChange(state) {
  // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    console.log(state);
    let connection = new Pryv.Connection(state.apiEndpoint);
    displayDiv(true);
    await setupConnection(connection);
    updateSharings();
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    pryvHF.pryvConn = null;
    connection = null;
    displayDiv(false);
  }
}

/* Show collection and visualization div when the user is connected */
function displayDiv(isDisplay) {
  let display = isDisplay ? '' : 'none';
  if (isMobile) {
    document.getElementById('accelerometer-collect').style.display = display;
    document.getElementById(
      'accelerometer-visualization'
    ).style.display = display;
  } else {
    document.getElementById('mouse-tracker').style.display = display;
    document.getElementById('mouse-visualization').style.display = display;
  }
  document.getElementById('sharing-view').style.display = display;
}

async function setupConnection(connection) {
  // A- retrieve previously created events or create events holders
  let resultTreatment = [];
  let apiCalls = [];
  let streams = (await connection.get('streams', null)).streams;
  let [hasRootStream, hasDesktopStream, hasMobileStream] = isInStreams(streams);
  if (!hasRootStream) {
    apiCalls.push({
      method: 'streams.create',
      params: {
        id: 'hfdemo',
        name: 'HF Demo',
        parentId: 'hf'
      }
    });
    resultTreatment.push(null);
  }
  if (isMobile) {
    /* If streams for mobile devices do not exist */
    if (!hasMobileStream) {
      apiCalls.push(
        // Accelerometer
        {
          method: 'streams.create',
          params: {
            id: 'hfdemo-orientation-gamma',
            name: 'Orientation-Gamma',
            parentId: 'hfdemo'
          }
        },
        {
          method: 'streams.update',
          params: {
            id: 'hfdemo-orientation-gamma',
            update: {
              clientData: stdPlotly('Orientation', 'angle/deg', 'Gamma')
            }
          }
        },
        {
          method: 'streams.create',
          params: {
            id: 'hfdemo-orientation-beta',
            name: 'Orientation-Beta',
            parentId: 'hfdemo'
          }
        },
        {
          method: 'streams.update',
          params: {
            id: 'hfdemo-orientation-beta',
            update: {
              clientData: stdPlotly('Orientation', 'angle/deg', 'Beta')
            }
          }
        },
        {
          method: 'streams.create',
          params: {
            id: 'hfdemo-orientation-alpha',
            name: 'Orientation-Alpha',
            parentId: 'hfdemo'
          }
        },
        {
          method: 'streams.update',
          params: {
            id: 'hfdemo-orientation-alpha',
            update: {
              clientData: stdPlotly('Orientation', 'angle/deg', 'Alpha')
            }
          }
        }
      );

      resultTreatment.push(null, null, null, null, null, null);
    }
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
    resultTreatment.push(
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
  } else {
    /* If streams for desktop devices do not exist */
    if (!hasDesktopStream) {
      apiCalls.push(
        // MOUSE
        {
          method: 'streams.create',
          params: {
            id: 'hfdemo-mouse-x',
            name: 'Mouse-X',
            parentId: 'hfdemo'
          }
        },
        {
          method: 'streams.update',
          params: {
            id: 'hfdemo-mouse-x',
            update: {
              clientData: stdPlotly('Mouse', 'count/generic', 'X')
            }
          }
        },
        {
          method: 'streams.create',
          params: {
            id: 'hfdemo-mouse-y',
            name: 'Mouse-Y',
            parentId: 'hfdemo'
          }
        },
        {
          method: 'streams.update',
          params: {
            id: 'hfdemo-mouse-y',
            update: {
              clientData: stdPlotly('Mouse', 'count/generic', 'Y')
            }
          }
        }
      );

      resultTreatment.push(null, null, null, null);
    }
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
    resultTreatment.push(
      function handleCreateEventX(result) {
        pryvHF.measures.mouseX.event = result.event;
        console.log('handle xEvent set', result.event);
      },
      function handleCreateEventY(result) {
        pryvHF.measures.mouseY.event = result.event;
        console.log('handle yEvent set', result.event);
      }
    );
  }

  const result = connection.api(apiCalls);
  result
    .then((result, err, resultInfo) => {
      if (err) {
        return console.log('...error: ' + JSON.stringify([err, result]));
      }
      console.log('...event created: ' + JSON.stringify(result));
      if (result) {
        for (let i = 0; i < result.length; i++) {
          if (resultTreatment[i]) {
            /* If no new event is created => error with token */
            if (result[i].event == null) {
              throw new Error(
                "The given token's access permissions do not allow to create an event. Please suppress the app access before reconnecting"
              );
            }
            resultTreatment[i].call(null, result[i]);
          }
        }
      } else {
        console.log(' No result!!', resultInfo);
      }
    })
    .catch(error => {
      alert(error);
      displayDiv(false);
    });
  pryvHF.pryvConn = connection;

  /**
   * @returns hasRootStream: True if streams hfdemo exists
   * @returns hasDesktopStream: True if streams for desktop devices exist
   * @returns hasMobileStream: True if streams for mobile devices exist
   */
  function isInStreams(streams) {
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

function stdPlotly(key, type, name) {
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

/* Post the HF data every samplePostMs */
function samplePost() {
  if (pryvHF.pryvConn) {
    postBatch(pryvHF.pryvConn, pryvHF.measures);
  }
  setTimeout(samplePost, samplePostMs);
}

function postBatch(connection, measures) {
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
async function fetch() {
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
    fetch();
  } else {
    setTimeout(fetch, delayIfEmptyBatch);
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
  } catch (error) {
    container.style.display = 'none';
    alert('Error to fetch data');
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
            if (x == IMAGE_START || x == IMAGE_END) {
              return x;
            }
            return THREE.Math.degToRad(x);
          });
          pointsBeta = pointsBeta.points.map(([timestamp, x]) => {
            if (x == IMAGE_START || x == IMAGE_END) {
              return x;
            }
            return THREE.Math.degToRad(x);
          });
          pointsAlpha = pointsAlpha.points.map(([timestamp, x]) => {
            if (x == IMAGE_START || x == IMAGE_END) {
              return x;
            }
            return THREE.Math.degToRad(x);
          });
          recordAccelerometer(pointsAlpha, pointsBeta, pointsGamma, l);
        }
      }
    );
  } catch (error) {
    container.style.display = 'none';
    alert('Error to fetch data');
  }
}

/* Calculate the number of points fetched per second */
function frequency() {
  if (pryvHF.pryvConn) {
    if (pryvHF.measures.mouseX.event) {
      frequencyMouse.innerHTML =
        'Fetch frequency: ' + pointsSecondMouse + ' points/s';
    }
    if (pryvHF.measures.orientationGamma.event) {
      frequencyAccelerometer.innerHTML =
        'Fetch frequency: ' + pointsSecondAccelerometer + ' points/s';
    }
    pointsSecondMouse = 0;
    pointsSecondAccelerometer = 0;
  }
  setTimeout(frequency, 1000);
}
