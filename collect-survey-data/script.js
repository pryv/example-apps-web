let connection = null;

const authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-simple-form', // to customize for your own app
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

window.onload = (event) => {
  document.getElementById('submit-button').addEventListener("click", submitForm);

  // following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
  const serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || 'https://reg.pryv.me/service/info';
  Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
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

  const result = await connection.api(apiCall);
  console.log(result);
  alert('Thank you for answering these questions!');
  return false;
}
