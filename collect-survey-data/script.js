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
        level: 'create-only' // permissions for the app to write data in stream 'Body'
      },
      {
        streamId: 'baby',
        defaultName: 'Baby',
        level: 'create-only' // permissions for the app to write data in stream 'Baby'
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

// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
// there are two options for this app : if we have the apiEndpoint provided in the parameters, 
// then we do not propose to login but directly display the data 
const urlParams = new URLSearchParams(window.location.search);
const serviceInfoUrl = urlParams.get('pryvServiceInfoURL') || 'https://reg.pryv.me/service/info';

window.onload = (event) => {
  Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
  document.getElementById('submit-button').addEventListener("click", submitForm);
};


async function submitForm() {
  const babyWeight = document.getElementById('baby-weight').value;
  const systolic = document.getElementById('systolic').value;
  const diastolic = document.getElementById('diastolic').value;
   // We include creation of the streams anyways
   // If they already exist in the account, this will not affect the next 
   // calls while insuring their existence.
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

  function logResultToConsole(result) {
    console.log('result: ', JSON.stringify(result));
  }

  if (!isNaN(babyWeight)) {
    apiCall.push({
      method: 'events.create', // create the event in the corresponding stream 'Baby-Body'
      params: {
        streamId: 'baby-body',
        type: 'mass/kg', // See: https://api.pryv.com/event-types/ for event types directory
        content: Number(babyWeight),
      },
      handleResult: logResultToConsole // Pryv's js-lib handles per-call handler
    });
  } else {
    alert('Please enter a number for baby\'s weight');
  }

  if (!isNaN(systolic) && !isNaN(diastolic)) {
    apiCall.push({
      method: 'events.create', // create the event in the corresponding stream 'Heart'
      params: {
        streamId: 'heart',
        type: 'blood-pressure/mmhg-bpm', // See: https://api.pryv.com/event-types/ for event types directory
        content: {
          systolic: Number(systolic),
          diastolic: Number(diastolic),
        }
      },
      handleResult: logResultToConsole // Pryv's js-lib handles per-call handler
    });
  } else {
    alert('Please enter a number for the systolic & diastolic values');
  }

  const result = await connection.api(apiCall);
  console.log(result);
  alert('Thank you for answering these questions!');
  return false;
}
