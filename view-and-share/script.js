var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-example-view-and-share', // to customize for your own app
    requestedPermissions: [
      {
        streamId: 'body',
        defaultName: 'Body',
        level: 'read' // permissions for the app to read data in stream 'Body'
      },
      {
        streamId: 'baby',
        defaultName: 'Baby',
        level: 'read' // permissions for the app to read data in stream 'Baby'
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt',
        'content': 'This sample app demonstrates how you can visualize and share data with an app token.' // to customize according to your own use case
      }
    },
  }
};

function pryvAuthStateChange(state) { // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    connection = new Pryv.Connection(state.apiEndpoint);
    username = state.displayName; 
    showData();
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    connection = null;
    showLoginMessage();
  }
}

async function showData() {
  resetData();
  document.getElementById('please-login').style.visibility = 'hidden';
  document.getElementById('data-view').style.display = '';
  document.getElementById('data-view').style.visibility = 'visible';
  document.getElementById('sharing-view').style.display = '';
  document.getElementById('sharing-view').style.visibility = 'visible';
  await loadData();
}

function showLoginMessage() {
  resetData();
  document.getElementById('please-login').style.visibility = 'visible';
  document.getElementById('data-view').style.display = 'none';
  document.getElementById('data-view').style.visibility = 'hidden';
  document.getElementById('sharing-view').style.display = 'none';
  document.getElementById('sharing-view').style.visibility = 'hidden';
}


// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
const urlParams = new URLSearchParams(window.location.search);
const apiEndpoint = urlParams.get('pryvApiEndpoint');
const serviceInfoUrl = urlParams.get('pryvServiceInfoURL') || 'https://reg.pryv.me/service/info';

var service = null; // will be initialized after setupAuth;
var username = null; // will be inialized after AUTHORIZED auth State is received
window.onload = async (event) => {
  
  if (apiEndpoint != null) { // if apiEndpoint then we are in "View only mode"
    document.getElementById('welcome-message-mme').style.visibility = 'hidden';
    document.getElementById('welcome-message-viewer').style.visibility = 'visible';
    connection = new Pryv.Connection(apiEndpoint);
    let displayUsername = apiEndpoint.split('@')[1];
    if (displayUsername[displayUsername.length - 1] == '/') displayUsername = displayUsername.slice(0,-1);
    document.getElementById('username').innerText = displayUsername;
    showData();  
  } else { // we propose a login
    service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);

    // register "Create" sharing button event listener 
    document.getElementById('create-sharing').addEventListener("click", createSharing);
  }
};

function resetTable(tableId) {
  var tableBody = document.querySelector('#' + tableId + ' tbody');
  if (tableBody)
    while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);
}

function resetData() {
  resetTable('baby-weight-table');
  resetTable('blood-pressure-table');
  resetTable('sharings-table');
}

async function loadData() {
  const result = await connection.api([{method: 'events.get', params: {limit: 40}}]); // get events from the Pryv.io account
  const events = result[0].events;
  if (! events || events.length === 0) {
    alert('There is no data to show. Use the Collect survey data example first');
    return;
  }
  // grab data lists
  const babyDataTable = document.getElementById('baby-weight-table');
  const heartDataTable = document.getElementById('blood-pressure-table');
  babyDataTable.style.visibility = 'collapse';
  heartDataTable.style.visibility = 'collapse';
  for (const event of events) {
    if (event.streamIds.includes('baby-body') && event.type === 'mass/kg') { // get 'mass/kg' events from the stream 'Baby-Body'
      addTableEvent(babyDataTable, event, [event.content + ' Kg']);
      babyDataTable.style.visibility = 'visible';
    }
    if (event.streamIds.includes('heart') && event.type === 'blood-pressure/mmhg-bpm') { // get 'blood-pressure/mmhg-bpm' events from the stream 'Heart'
      addTableEvent(heartDataTable, event, [event.content.systolic + 'mmHg', event.content.diastolic + 'mmHg']);
      heartDataTable.style.visibility = 'visible';
    }
  }
  if (apiEndpoint == null) // display sharings only when logged-in
    updateSharings();
}
function addTableEvent(table, event, items) {
  const date = new Date(event.time * 1000); // add date of the fetched events
  const dateText = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes();

  const row = table.insertRow(-1);
  row.insertCell(-1).innerHTML = dateText;
  for (const item of items) {
    row.insertCell(-1).innerHTML = item;
  }
};


// ----- Sharings

async function updateSharings() {
  const result = await connection.api([ // https://github.com/pryv/lib-js#api-calls
    { 
      method: 'accesses.get', // get accesses of the data: https://api.pryv.com/reference/#get-accesses
      params: {}
    }
  ]); 
  const sharingTable = document.getElementById('sharings-table');
  const accesses = result[0].accesses;
  if (! accesses || accesses.length === 0) {
    return;
  }
  resetTable('sharings-table'); // empty list
  for (const access of accesses) {
    await addListAccess(sharingTable, access);
  }
}

async function createSharing() {
  const isBabyChecked = document.getElementById('check-baby').checked;
  const isBPChecked = document.getElementById('check-bp').checked;
  if (! isBPChecked && ! isBabyChecked) { 
    alert('Check at least one of the streams "Baby-Body" or "Heart"');
    return;
  }
  const name = document.getElementById('sharing-name').value.trim();
  if (! name || name === '') {
    alert('Enter a name for your sharing');
    return;
  }
  // set permissions
  const permissions = [];
  if (isBabyChecked) permissions.push({streamId: 'baby-body', level: 'read'});
  if (isBPChecked) permissions.push({ streamId: 'heart', level: 'read' });

  const res = await connection.api([ // https://github.com/pryv/lib-js#api-calls
    { 
      method: 'accesses.create', // creates the selected access: https://api.pryv.com/reference/#create-access
      params: {
        name: name,
        permissions: permissions
      }
  }]);
  const error = res[0].error;
  if (error != null) {
    displayError(error);
    return;
  }
  updateSharings();

  function displayError(error) {
    let message = error.message;
    if (error.id.includes('forbidden')) {
      message = `${error.message} Please use the Collect survey data example first.`
    }
    alert(JSON.stringify(message, null, 2));
  }
}

async function addListAccess(table, access) { // add permissions to the sharings table
  
  const permissions = [];
  for (const permission of access.permissions) permissions.push(permission.streamId);
  const apiEndpoint = await service.apiEndpointFor(username, access.token);

  const sharingURL = window.location.href.split('?')[0] + '?pryvApiEndpoint=' + apiEndpoint;
  const sharingLink = '<a href="' + sharingURL + '" target="_new"> open </a>';

  const emailSubject = encodeURIComponent('Access my ' + permissions.join(', ') + ' data');
  const emailBody = encodeURIComponent('Hello,\n\nClick on the following link ' + sharingURL);

  const emailLink = '<a href="mailto:?subject=' + emailSubject + '&body=' + emailBody + '"> email </a>';

  const deleteLink = '<a href="" onclick="javascript:deleteSharing(\'' + access.id + '\');return false;">' + access.name + '</a>';

  const row = table.insertRow(-1);
  row.insertCell(-1).innerHTML = deleteLink;
  row.insertCell(-1).innerHTML = permissions.join(', ');
  row.insertCell(-1).innerHTML = sharingLink;
  row.insertCell(-1).innerHTML = emailLink;
};

async function deleteSharing(accessId) {
  if (! confirm('delete?')) return;
  await connection.api([ // https://github.com/pryv/lib-js#api-calls
    {
      method: 'accesses.delete', // deletes the selected access: https://api.pryv.com/reference/#delete-access 
      params: {id: accessId}
  }
]); 
  updateSharings();
}