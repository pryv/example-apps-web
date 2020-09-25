const firstFetchWithMouse = 1;
const notFirstFetch = -1;
let isFirstEventMouse = false;

/* Visualization only */
async function buildVisualizationOnly(apiEndpoint, urlParams) {
  Array.from(document.getElementsByClassName('delete-event-button')).forEach(element => element.style.display = 'none');
  document.getElementById('selection-data').style.display = '';
  pryvHF.pryvConn = new Pryv.Connection(apiEndpoint);

  const eventsList = await getEventList();
  populateCollectionTable(eventsList);

  const username = await pryvHF.pryvConn.username();
  document.getElementById('name-selection').innerHTML =
    'Tracking sessions of ' + username;
  document.getElementById('live').addEventListener('click', switchToLive);
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
  if (!eventId_mouseX && !eventId_alpha) {
    buildLive();
  }

  async function buildLive() {
    buildDesktop();
    buildMobile();
    is_live = true;
    document.getElementById('accelerometer-show').style.display = 'none';
    const monitor = await (new Pryv.Monitor(apiEndpoint, { limit: 3 })
      .on(Pryv.Monitor.Changes.EVENT, function (event) {
        switch (event.streamId) {
          case 'hfdemo-mouse-y':
            // Because fetch 3 events at the loading and if we fetch mouse event => the third can be another sketch/recording
            if(isFirstEventMouse == firstFetchWithMouse){
              isFirstEventMouse = notFirstFetch;
              break;
            }
            if(!isFirstEventMouse){
              isFirstEventMouse = firstFetchWithMouse;
            }
            prepareLive(false);
            const eventDate = new Date(event.time * 1000)
            document.getElementById('date-mouse').innerHTML = 'Start date: ' + eventDate.toUTCString();
            clearCtx(renderCtx);
            pryvHF.measures.mouseY.event = event;
            break;
          case 'hfdemo-mouse-x':
            pryvHF.measures.mouseX.event = event;
            break;
          case 'hfdemo-orientation-alpha':
            if(isFirstEventMouse == firstFetchWithMouse){
              isFirstEventMouse = notFirstFetch;
              break;
            } else{
              prepareLive(true);
              const eventDate = new Date(event.time * 1000);
              document.getElementById('date-accelerometer').innerHTML = 'Start date: ' + eventDate.toUTCString();
              const now = Date.now() / 1000;
              fromTime = now;
              emptyRecordingBuffer();
              isFirstEventMouse = notFirstFetch;
              pryvHF.measures.orientationAlpha.event = event;
              break;
            }
          case 'hfdemo-orientation-beta':
            pryvHF.measures.orientationBeta.event = event;
            break;
          case 'hfdemo-orientation-gamma':
            pryvHF.measures.orientationGamma.event = event;
        }
        console.log('> New event', event);
      })
      //.addUpdateMethod(new Pryv.Monitor.UpdateMethod.EventsTimer(1000))
      .addUpdateMethod(new Pryv.Monitor.UpdateMethod.Socket())
    ).start();
  }

  function prepareLive(isMobile) {
    if (isMobile) {
      document.getElementById('mouse-visualization').style.display = 'none';
      document.getElementById('accelerometer-visualization').style.display = '';
    }
    else {
      document.getElementById('mouse-visualization').style.display = '';
      document.getElementById('accelerometer-visualization').style.display = 'none';
    }
    pryvHF.measures.mouseX.event = null;
    pryvHF.measures.mouseY.event = null;
    pryvHF.measures.orientationAlpha.event = null;
    pryvHF.measures.orientationBeta.event = null;
    pryvHF.measures.orientationGamma.event = null;
  }

  /* Aggregate the related events from different streams together */

  async function getEventList() {
    const eventsList = [];
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

function switchToLive() {
  const baseUrl = window.location.href.split('&')[0].replace('#', '');
  window.location.href = baseUrl;
}
