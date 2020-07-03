
# Pryv Collect survey data tutorial

All you need to run this app is to download [index.html](index.html) and [script.js](script.js) files and open **index.html** with your browser.

This is a simple form application that first displays a welcome message and a button to initiate the authentication process. With click on the login button, a popup opens in your browser where you can either authenticate or create a new account. When signed in, you can consent to give the app access to some streams where the form data will be saved.

Once you have accepted, it displays the form to enter your baby's weight and your own blood pressure.

When you have entered the requested values, you can press *submit* to save data into your Pryv.io account.

## Customize the form

You will find the form related code in the [index.html](index.html) file. We invite you to customize it with your own welcome message, style and survey questions according to your use case.

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
let connection = null;

const authSettings = {
  spanButtonID: 'pryv-button', 
  onStateChange: pryvAuthStateChange, 
  authRequest: { 
    requestingAppId: 'pryv-simple-form', 
    requestedPermissions: [ 
      {
        streamId: 'body',
        defaultName: 'Body',
        level: 'manage' 
      },
      {
        streamId: 'baby',
        defaultName: 'Baby',
        level: 'manage' 
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt',
        'content': 'This sample app demonstrates how an institution can track the weight of a newborn baby alongside with the mother\'s blood pressure to prevent hypertension.'
      }
    },
  }
};

function pryvAuthStateChange(state) {
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    showForm();
    connection = new Pryv.Connection(state.apiEndpoint);
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    showLoginMessage();
    connection = null;
  }

  function showForm() {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('form').style.visibility = 'visible';
  }
  function showLoginMessage() {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('form').style.visibility = 'hidden';
  }
}
```

If the streams of the `requestedPermissions` array do not exist in the user's account upon authentication, they are created, the `defaultName` field serving as `name` for the [data structure](https://api.pryv.com/reference/#stream).

The auth request is done on page load:

```javascript
window.onload = (event) => {
  // ...
  Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
};
```

## Save data

In order to save data, we add a listener to the *submit* button:

```javascript
window.onload = (event) => {
  document.getElementById('submit-button').addEventListener("click", submitForm);
  // ...
};
```

This will fetch values from the `input` tags:

```javascript
const babyWeight = document.getElementById('baby-weight').value;
const systolic = document.getElementById('systolic').value;
const diastolic = document.getElementById('diastolic').value;
```

It will package those values into [events.create](https://api.pryv.com/reference/#create-event) [batch calls](https://api.pryv.com/reference/#call-batch), previously verifying that the entered values are indeed numbers:

```javascript
if (!isNaN(babyWeight) || !isNaN(systolic) || !isNaN(diastolic)) {
    apiCall.push({
      method: 'events.create',
      params: {
        streamId: 'baby-body',
        type: 'mass/kg',
        content: Number(babyWeight),
      },
      handleResult: logResultToConsole 
    });
    apiCall.push({
      method: 'events.create',
      params: {
        streamId: 'heart',
        type: 'blood-pressure/mmhg-bpm',
        content: {
          systolic: Number(systolic),
          diastolic: Number(diastolic),
        }
      },
      handleResult: logResultToConsole
    });
  } else {
    alert('Please enter a number for the baby\'s weight and the systolic / diastolic values.');
  }
```

As we wish to save these values into streams that are not part of the streams of the `requestedPermissions`, we ensure that they exist by bundling them in the batch call, previous to the `events.create` methods, as the array of methods is executed in order by the API:

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

Following our [app guidelines](https://api.pryv.com/guides/app-guidelines/), we build apps that can work for multiple Pryv.io platforms providing a `serviceInfoUrl` query parameter:

```javascript
const serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || 'https://reg.pryv.me/service/info';
```

To set a custom Pryv.io platform, provide the service information URL as shown here for the Pryv Lab:

[https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoUrl=https://reg.pryv.me/service/info](https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoUrl=https://reg.pryv.me/service/info)

 To launch this app on your [local Open Pryv.io platform](https://github.com/pryv/open-pryv.io#development) use (the link requires to have a running Open Pryv.io with the rec-la SSL proxy):

[https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoUrl=https://my-computer.rec.la:4443/reg/service/info](https://pryv.github.io/app-web-examples/collect-survey-data/?pryvServiceInfoUrl=https://my-computer.rec.la:4443/reg/service/info).