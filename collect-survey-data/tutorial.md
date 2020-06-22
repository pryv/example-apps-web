
# Collect survey data tutorial

## Define form

This is a simple form application, as you can see, when open, it displays a button to initiate the authentication process, which opens a popup where you can either authenticate or create a new account, then you can consent to give the app access to some streams where the form data will be saved.

Once you have accepted, it displays the form to enter your baby's weight and his blood pressure.

When you have entered the requested values, you can press *submit* to save data into your Pryv.io account.

## Define form

You will find the form related code in the [index.html](index.html) file.

## Authenticate your app

For this application, we have used the [Pryv JavaScript library](), loading it for [the browser](https://github.com/pryv/lib-js#browser) as following:

```html
<script src="https://api.pryv.com/lib-js/pryv.js"></script>
```

For authentication, we will use the [Pryv.io consent process](https://github.com/pryv/lib-js#within-a-webpage-with-a-login-button) adding the following element in the HTLM:

```html
<span id="pryv-button"></span>
```

The [auth request parameters](https://api.pryv.com/reference/#auth-request) and callback are defined in the separate [script.js](script.js) file:

```javascript
var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-example-simple-form', // to customize for your own app
    languageCode: 'en', // optional (default english)
    requestedPermissions: [ 
      {
        streamId: 'body',
        defaultName: 'Body',
        level: 'manage' // permissions for the app to write data in stream 'Body'
      },
      {
        streamId: 'baby',
        defaultName: 'Baby',
        level: 'manage' // permissions for the app to write data in stream 'Baby'
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt',
        'content': 'This sample app demonstrates how an institution can track the weight of a newborn baby alongside with the mother\'s blood pressure to prevent hypertension.'
      } // to customize according to your own use case
    },
  }
};

function pryvAuthStateChange(state) { // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('form').style.visibility = 'visible';
    connection = new Pryv.Connection(state.apiEndpoint);
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('form').style.visibility = 'hidden';
    connection = null;
  }
}
```

If the streams of the `requestedPermissions` array do not exist in the user's account upon authentication, they are created, the `defaultName` field serving as `name` for the [data structure](https://api.pryv.com/reference/#stream).

The auth request is done on page load:

```javascript
window.onload = (event) => {
  Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
  // ...
};
```

## Save data

In order to save data, we add a listener to the *submit* button:

```javascript
window.onload = (event) => {
  // ...
  document.getElementById('submit-button').addEventListener("click", submitForm);
};
```

This will fetch, values from the `input` tags:

```javascript
const babyWeight = document.getElementById('baby-weight').value;
const systolic = document.getElementById('systolic').value;
const diastolic = document.getElementById('diastolic').value;
```

It will package those values into [events.create](https://api.pryv.com/reference/#create-event) [batch calls](https://api.pryv.com/reference/#call-batch), previously verifying that the entered values are indeed numbers:

```javascript
if (!isNaN(babyWeight) || !isNaN(systolic) || !isNaN(diastolic)) {
    apiCall.push({
      method: 'events.create', // create the event in the corresponding stream 'Baby-Body'
      params: {
        streamId: 'baby-body',
        type: 'mass/kg', // See: https://api.pryv.com/event-types/#mass
        content: Number(babyWeight),
      },
      handleResult: logResultToConsole // Pryv's lib-js per-call handler
    });
    apiCall.push({
      method: 'events.create', // create the event in the corresponding stream 'Heart'
      params: {
        streamId: 'heart',
        type: 'blood-pressure/mmhg-bpm', // See: https://api.pryv.com/event-types/#blood-pressure
        content: {
          systolic: Number(systolic),
          diastolic: Number(diastolic),
        }
      },
      handleResult: logResultToConsole // Pryv's lib-js per-call handler
    });
  } else {
    alert('Please enter a number for the baby\'s weight and the systolic / diastolic values.');
  }
```

As we wish to save these values into streams that are not part of the streams of the `requestedPermissions`, we ensure that they exist by bundling them in the batch call, previous to the `events.create` methods, as the array of methods is execute in order by the API:

```javascript
const apiCall = [
  {
    method: 'streams.create',
    params: {
      id: 'baby-body',
      name: 'Baby-Body',
      parentId: 'baby'
    }
  },
  {
    method: 'streams.create',
    params: {
      id: 'heart',
      name: 'Heart',
      parentId: 'body'
    }
  }
];
```

Finally, we make the API call using [Connection.api()](https://github.com/pryv/lib-js#api-calls) method:

```javascript
const result = await connection.api(apiCall);
```

## App guidelines

Following our [app guidelines](https://api.pryv.com/guides/app-guidelines/), we build apps that can work for specific Pryv.io platforms using a [service information URL] or [apiEndpoint] provided in the URL's query parameters:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const serviceInfoUrl = urlParams.get('pryvServiceInfoURL') || 'https://reg.pryv.me/service/info';
```

This allows to launch this app on your [local Open Pryv.io](https://github.com/pryv/open-pryv.io#development) providing the service information URL:

[https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoURL=https://my-computer.rec.la:4443/reg/service/info](https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoURL=https://my-computer.rec.la:4443/reg/service/info).