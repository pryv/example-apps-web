var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-example-simple-form',
    languageCode: 'en', // optional (default english)
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
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt',
        'content': 'This sample app demonstrates how an institution can track the weight of a newborn baby alongside with the mother\'s blood pressure to prevent hypertension.'
      }
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


var serviceInfoUrl = 'https://reg.pryv.me/service/info';
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
      method: 'events.create',
      params: {
        streamId: 'baby-body',
        type: 'mass/kg',
        content: Number(babyWeight),
      },
      handleResult: logResultToConsole // Pryv's js-lib handles per-call handler
    });
  } else {
    alert('Please enter a number for baby\'s weight');
  }

  if (!isNaN(systolic) && !isNaN(diastolic)) {
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
    alert('Please enter a number for the systolic & diastolic values');
  }

  const result = await connection.api(apiCall);
  console.log(result);
  alert('Thank you for answering these questions!');
  return false;
}
