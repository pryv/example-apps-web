
# Pryv Collect and view HF data tutorial

You can try the live version of the app [here](https://api.pryv.com/example-apps-web/hf-data/).

All you need to run this app is to download [index.html](index.html), [script.js](script.js) files, [js/](js) and [assets](assets) folders and open [index.html](index.html) with your browser.

This is a data collection and sharing web app that first displays a welcome message and a button to initiate the authentication process.
<p align="center">
<img src="images/1-login.png" alt="login" width="700"/>
</p>

With a click on the login button, a popup opens in your browser where you can either authenticate or create a new account. 

When signed in, you can consent to give the app "app-web-hfdemo" permission to manage the stream "**HF**" where the data from the tracker is stored.
<p align="center">
<img src="images/2-request-permission.png" alt="request-permissions" width="400"/>
</p>

Once you have accepted, you can start the tracking task using the accelerometer or the mouse.

|Desktop                                                 | Mobile                                                  |
| -------------------------------------------------------|---------------------------------------------------------|
| <img src="images/tracker-1.png" alt="tracker" style="zoom:50%;" /> | <img src="images/collect-acc.jpg" alt="collect" style="zoom:10%;" /> |

You can visualize your data in the "Visualization" section of the app:

|Desktop                                                 | Mobile                                                  |
| -------------------------------------------------------|---------------------------------------------------------|
| <img src="images/visu-2.png" alt="view" style="zoom:50%;" /> | <img src="images/delete-acc.jpg" alt="view" style="zoom:10%;" /> |

You can then share your data by creating a new sharing at the bottom of the page. This will generate a URL link that contains your tracking visualization from the stream "**HF**".

<p align="center">
<img src="images/sharing.png" alt="new-sharing" width="700"/>
</p>

The sharing link enables the recipient to consult the list of trackings, along with the tracking method (desktop or mobile), and to click on a tracking to visualize it on the screen:

|Desktop                                                 | Mobile                                                  |
| -------------------------------------------------------|---------------------------------------------------------|
| <img src="images/share-data.png" alt="desktop" style="zoom:50%;" /> | <img src="images/share-acc2.png" alt="mobile" style="zoom:50%;" /> |

The functionality **Show Live Event** enables the data accessor to display the drawing or the phone orientation (depending on the tracking method) while the patient is performing the test remotely.

## Authenticate your app

For this application, we have used the [Pryv JavaScript library](https://github.com/pryv/lib-js), loading it for [the browser](https://github.com/pryv/lib-js#browser) as following in [index.html](index.html):

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

For authentication, we will use the [Pryv.io consent process](https://github.com/pryv/lib-js#within-a-webpage-with-a-login-button) adding the following element in the HTML:

```html
<span id="pryv-button"></span>
```

The [auth request parameters](https://api.pryv.com/reference/#auth-request) and callback are defined in the separate [connection.js](js/connection.js) file:

```javascript
async function performAuthRequest() {
  const authSettings = {
    spanButtonID: 'pryv-button', 
    onStateChange: pryvAuthStateChange,
    authRequest: {
      requestingAppId: 'app-web-hfdemo',
      requestedPermissions: [
        {
          streamId: 'hf',
          defaultName: 'HF',
          level: 'manage'
        }
      ],
      requestingAppId: 'app-web-hfdemo'
    }
  };

  Pryv.Browser.setupAuth(authSettings, serviceInfoInput.value);
}
```

The root stream "**HF**" of the `requestedPermissions` array is created if it doesn't exist yet. It will then be populated with events data from the tracking test.

The auth request is done on page load, except when the shared data is loaded by a third-party.

## Collect HF data

Data collected from the mouse movement (desktop version) or device orientation (accelerometer version) will be stored in the form of [HF series](https://api.pryv.com/reference/#data-structure-high-frequency-series) which are collections of homogenous data points in Pryv.io.

### Collect HF data using the Desktop version

Once the user is signed in (Desktop version), he can perform the test using the mouse tracker. The code for the mouse tracker is contained in the file [desktop.js](./js/desktop.js).  
Data collected from the mouse movement (X and Y positions) will be stored in the form of [HF series](https://api.pryv.com/reference/#data-structure-high-frequency-series) in a dedicated stream.  

Connection with Pryv is established to store collected measures in the stream "**HF demo**" (see file [connection.js](js/connection.js)):
```javascript
async function setupStreamStructure(connection) {
  const resultHandlers = [];
  const apiCalls = [];
  const streams = (await connection.get('streams', null)).streams;
  const [hasRootStream, hasDesktopStream, hasMobileStream] = hasStreams(
    streams
  );
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
  }
```
As both X and Y positions will be captured during the recording, two substreams "**Mouse-X**" and "**Mouse-Y**" are created to hold events related to measured positions:
```javascript
if (!hasDesktopStream) {
      apiCalls.push(
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
```

[HF events](https://api.pryv.com/reference/#create-hf-event) need to be created to hold the mouse position, which will be consisting of points along the x and y-axis of type `count/generic` (see [Event Types Reference](https://api.pryv.com/event-types/)):

```javascript
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
```

These events are populated with the X and Y positions of the mouse:
```javascript
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
      measures[key].buffer = [];
    }
  }
}
```

### Collect HF data using the mobile version

The tracking task is also available in a mobile version that allows to collect the device orientation in three dimensions. The code for the mobile accelerometer is contained in the file [mobile.js](js/mobile.js).  

Similarly as for the [Desktop version](#collect-hf-data-using-the-desktop-version), connection with Pryv is established to store collected measures in the stream "**HF demo**" (see [connection.js](js/connection.js)).  

In the mobile version, as three different angles will be captured during the recording, three substreams "**Orientation-Alpha**", "**Orientation-Beta**" and "**Orientation-Gamma**" are created to hold events related to measured angles:

```javascript
if (!hasMobileStream) {
  apiCalls.push(
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
```
These streams are populated with HF events that will hold data collected from the accelerometer (*alpha*, *beta* and *gamma* orientation angles, thus events of [type](https://api.pryv.com/event-types/) `angle/deg`):

```javascript
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
```

Similarly as for the X and Y mouse positions of the [Desktop version](#collect-hf-data-using-the-desktop-version), collected data from the accelerometer orientation is inserted in the previously created HF events:
```javascript
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
      measures[key].buffer = [];
    }
  }
}
```

## Create a sharing

Once data from the tracking task has been collected, the app is designed to allow the user to share his data with a third-party.

The functions from the file [sharing.js](hf-data/js/sharing.js) enable the user to create a sharing that consists of a URL link (with a Pryv API endpoint) that displays the visualization from the tracking test. 

In order to create a sharing, we add a listener to the *Create* button:

```javascript
function buildSharing() {
  const sharing = document.getElementById('create-sharing');
  sharing.addEventListener('click', createSharing);
} 
```

The sharing is translated into the creation of a [shared access](https://api.pryv.com/concepts/#accesses) in Pryv.io. Values for the scope of the sharing ('streamId' and 'level' for permissions) are fetched, in our case "read" level on the stream "**HF Demo**":

```javascript
async function createSharing() {
    const name = document.getElementById('sharing-name').value.trim();
    if (!name || name === '') {
        alert('Enter a name for your sharing');
        return;
    }
    const permissions = [{ streamId: 'hfdemo', level: 'read' }];
```

These values are packaged into an [accesses.create](https://api.pryv.com/reference/#create-access) API call:
```javascript
  const results = await pryvHF.pryvConn.api([
    {
      method: 'accesses.create',
      params: {
        name: name,
        permissions: permissions
      }
    }
  ]);
  const error = results[0].error;
  if (error != null) {
    displayError(error);
    return;
  }
  updateSharings();
```

This call is made using [pryvConn.api()](https://github.com/pryv/lib-js#api-calls) method.

The sharings of the user are also displayed using the function **updateSharings()** that performs an [accesses.get](https://api.pryv.com/reference/#get-accesses) API call:

```javascript
async function updateSharings() {
  const result = await pryvHF.pryvConn.api([
    {
      method: 'accesses.get',
      params: {}
    }
  ]);
  const sharingTable = document.getElementById('sharings-table');
  const accesses = result[0].accesses;
  if (!accesses || accesses.length === 0) {
    return;
  }
  resetTable('sharings-table');
  for (const access of accesses) {
    await addListAccess(sharingTable, access);
  }
}
```

In the same way, the function **deleteSharing()** enables to delete the access selected by the user by performing an [accesses.delete](https://api.pryv.com/reference/#delete-access) API call.

```javascript
async function deleteSharing(accessId) {
    if (!confirm('delete?')) return;
    await pryvHF.pryvConn.api([ 
        {
            method: 'accesses.delete',
            params: { id: accessId }
        }
    ]);
    resetTable('sharings-table')
    updateSharings();
}
```

## Display the sharing (view-only mode)

Once the sharing has been created, it should enable third parties to consult data from the user in a "view-only" mode. In this mode, a table containing all performed tests is displayed, along with the date of the test and the tracking method.   

*Example: [https://api.pryv.com/example-apps-web/hf-data/?apiEndpoint=https://ckejrnjlq00z61kqosakom3wi@hf-app.pryv.me/](https://api.pryv.com/example-apps-web/hf-data/?apiEndpoint=https://ckejrnjlq00z61kqosakom3wi@hf-app.pryv.me/)* 

The recipient of the link can open the data visualization by clicking on the chosen test:
- the **Desktop version** contains the drawing performed with the mouse tracker
- the **Mobile version** displays the recording of the phone orientation

The code for the visualization mode is contained in the [js/view_only.js](js/view_only.js).

This will load the app already authenticated, by passing the `apiEndpoint` parameter in the function buildVisualizationOnly(apiEndpoint, urlParams). 

```javascript
async function buildVisualizationOnly(apiEndpoint, urlParams) {
  document.getElementById('selection-data').style.display = '';
  pryvHF.pryvConn = new Pryv.Connection(apiEndpoint);

  const eventsList = await getEventList();
  populateCollectionTable(eventsList);

  const username = await pryvHF.pryvConn.username();
  document.getElementById('name-selection').innerHTML =
    'Data Collection Of ' + username;

  const eventId_mouseX = urlParams.get('posXEventId');
  const eventId_mouseY = urlParams.get('posYEventId');
```

Either the mobile or the desktop versions are displayed depending on the user's available data:
```javascript
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
```

## App guidelines

### Custom service info

Following our [app guidelines](https://api.pryv.com/guides/app-guidelines/), we build apps that can work for multiple Pryv.io platforms providing a `serviceInfo` parameter in the file [connection.js](js/connection.js):

```javascript
async function fetchServiceInfo() {
    service = new Pryv.Service(serviceInfoInput.value);
    serviceInfo = await service.info();
    authRequest()
}

async function authRequest() {
    Pryv.Browser.setupAuth(authSettings, serviceInfoInput.value);
}
```
To set a custom Pryv.io platform, provide the service information URL or use the selector to choose your Pryv.io platform in the **Service information** accordion:

<p align="center">
<img src="images/service-info.png" alt="service-info" width=800 />
</p>

## Customize the visuals 

You will find the code related to the display of the data in the [index.html](index.html) file. We invite you to customize it with your own message and headings, and adapt the data display according to your needs.