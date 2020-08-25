/* Visualization only */
async function buildVisualizationOnly(apiEndpoint, urlParams) {
  document.getElementById('selection-data').style.display = '';
  pryvHF.pryvConn = new Pryv.Connection(apiEndpoint);

  let eventsList = await getEventList();
  populateCollectionTable(eventsList);

  const username = await pryvHF.pryvConn.username();
  document.getElementById('name-selection').innerHTML =
    'Data Collection Of ' + username;

  const eventId_mouseX = urlParams.get('posXEventId');
  const eventId_mouseY = urlParams.get('posYEventId');
  if (eventId_mouseX && eventId_mouseY) {
    pryvHF.measures.mouseX.event = {
      id: eventId_mouseX
    };
    pryvHF.measures.mouseY.event = {
      id: eventId_mouseY
    };
    buildDesktop();
    document.getElementById('mouse-visualization').style.display = '';
  }

  const eventId_alpha = urlParams.get('angleAEventId');
  const eventId_beta = urlParams.get('angleBEventId');
  const eventId_gamma = urlParams.get('angleYEventId');
  if (eventId_alpha && eventId_beta && eventId_gamma) {
    pryvHF.measures.orientationAlpha.event = {
      id: eventId_alpha
    };
    pryvHF.measures.orientationBeta.event = {
      id: eventId_beta
    };
    pryvHF.measures.orientationGamma.event = {
      id: eventId_gamma
    };
    buildMobile();
    document.getElementById('accelerometer-visualization').style.display = '';
  }

  /* Aggregate the related events from different streams together */

  async function getEventList() {
    let eventsList = [];
    const params = {
      fromTime: 0
    };
    let events;
    try {
      events = (await pryvHF.pryvConn.get('events', params)).events;
    } catch (e) {
      document.getElementById('container').style.display = 'none';
      alert('Endpoint incorrect');
      return;
    }
    for (let i = 0; i < events.length; i++) {
      if (events[i].streamId == 'hfdemo-mouse-y') {
        eventsList.push({
          date: events[i].created,
          mouseX: events[i + 1].id,
          mouseY: events[i].id
        });
        i += 1;
      } else {
        eventsList.push({
          date: events[i].created,
          alpha: events[i].id,
          beta: events[i + 1].id,
          gamma: events[i + 2].id
        });

        i += 2;
      }
    }
    return eventsList;
  }
}

function populateCollectionTable(events) {
  const table = document.getElementById('data-collection');
  for (const event of events) {
    addListEvent(table, event);
  }
}

function addListEvent(table, event) {
  let link;
  const baseUrl = window.location.href.split('&')[0];
  if (event.mouseX) {
    link =
      '<a href="' +
      baseUrl +
      '&posXEventId=' +
      event.mouseX +
      '&posYEventId=' +
      event.mouseY +
      '">Desktop</a>';
  } else {
    link =
      '<a href="' +
      baseUrl +
      '&angleAEventId=' +
      event.alpha +
      '&angleBEventId=' +
      event.beta +
      '&angleYEventId=' +
      event.gamma +
      '">Mobile</a>';
  }
  const date = new Date(event.date * 1000);
  const row = table.insertRow(-1);
  row.insertCell(-1).innerHTML = date.toUTCString();
  row.insertCell(-1).innerHTML = link;
}
