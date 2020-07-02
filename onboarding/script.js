let connection,
  serviceInfoSelect,
  serviceInfoInput,
  serviceInfo,
  serviceInfoDisplay;

const authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-simple-form', // to customize for your own app
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

window.onload = (event) => {
  serviceInfoSelect = document.getElementById('service-info-select');
  serviceInfoInput = document.getElementById('service-info-text');
  serviceInfoDisplay = document.getElementById('service-info-display');
  serviceInfoSelect.addEventListener("change", setServiceInfo);
  document.getElementById('auth-request-button').addEventListener("click", authRequest);
  document.getElementById('fetch-service-info-button').addEventListener("click", fetchServiceInfo);
};

async function fetchServiceInfo() {
  /*service = new Pryv.Service(serviceInfoInput);
  service = await service.info();
  */
  service = {
    "serial": "2019061301",
    "name": "Pryv Lab",
    "support": "https://pryv.com/helpdesk",
    "terms": "https://pryv.com/terms-of-use/",
    "access": "https://access.pryv.me/access/",
    "register": "https://reg.pryv.me/",
    "home": "https://sw.pryv.me",
    "eventTypes": "https://api.pryv.com/event-types/flat.json",
    "assets": {
      "definitions": "https://pryv.github.io/assets-pryv.me/index.json"
    },
    "api": "https://{username}.pryv.me/"
  };
  service = JSON.stringify(service, null, 2);
  serviceInfoDisplay.innerHTML = service;
}

function setServiceInfo() {
  console.log('ca a bougé')
  const selection = document.getElementById('service-info-select').value;
  serviceInfoInput.value = selection;
}


async function authRequest() {
  console.log('ca clique')
  //Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
}
