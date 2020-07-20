var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-example-view-and-share',
    languageCode: 'en', // optional (default english)
    requestedPermissions: [
      {
        streamId: 'body',
        defaultName: 'Body',
        level: 'read'
      },
      {
        streamId: 'baby',
        defaultName: 'Baby',
        level: 'read'
      }
    ],
    clientData: {
      'app-web-auth:description': {
        'type': 'note/txt',
        'content': 'This sample app demonstrates how you can visualize and share data with an app token.'
      }
    },
  }
};

function pryvAuthStateChange(state) { // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    resetData();
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    document.getElementById('sharing-view').style.visibility = 'visible';
    username = state.displayName; // (will be probably changed by username property)
    connection = new Pryv.Connection(state.apiEndpoint);
    loadData();
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
    document.getElementById('sharing-view').style.visibility = 'hidden';
    connection = null;
    resetData();
  }
}

// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
// there are two options for this app : if we have the apiEndpoint provided in the parameters, 
// then we do not propose to login but directly display the data 
const urlParams = new URLSearchParams(window.location.search);
const apiEndpoint = urlParams.get('pryvApiEndpoint');
const serviceInfoUrl = urlParams.get('pryvServiceInfoURL') || 'https://reg.pryv.me/service/info';

var service = null; // will be initialized after setupAuth;
var username = null; // will be inialized after AUTHORIZED auth State is recieved
window.onload = async (event) => {
  
  if (apiEndpoint) { // if apiEndpoint then we are in "View only mode"
    document.getElementById('welcome-message-mme').style.visibility = 'hidden';
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    document.getElementById('welcome-message-viewer').style.visibility = 'visible';
    document.getElementById('username').innerText = apiEndpoint.split('@')[1].slice(0,-1);
    connection = new Pryv.Connection(apiEndpoint);
    loadData();
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
  const result = await connection.api([{method: 'events.get', params: {limit: 40}}]);
  const events = result[0].events;
  if (! events || events.length === 0) {
    alert('There is no data to show. Use the example "simple-form" first');
    return;
  }
  // grab data lists
  const babyDataTable = document.getElementById('baby-weight-table');
  const heartDataTable = document.getElementById('blood-pressure-table');
  for (const event of events) {
    if (event.streamIds.includes('baby-body') && event.type === 'mass/kg') {
      addTableEvent(babyDataTable, event, [event.content + ' Kg']);
    }
    if (event.streamIds.includes('heart') && event.type === 'blood-pressure/mmhg-bpm') {

      addTableEvent(heartDataTable, event, 
        [event.content.systolic + 'mmHg', event.content.diastolic + 'mmHg']);
    }
  }
  if (! apiEndpoint) // display sharings only when logged-in
    updateSharings();
}
function addTableEvent(table, event, items) {
  const date = new Date(event.time * 1000);
  const dateText = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes();

  const row = table.insertRow(-1);
  row.insertCell(-1).innerHTML = dateText;
  for (const item of items) {
    row.insertCell(-1).innerHTML = item;
  }
};


// ----- Sharings

async function updateSharings() {
  const result = await connection.api([{ method: 'accesses.get', params: {}}]);
  const sharingTable = document.getElementById('sharings-table');
  console.log(result);
  const accesses = result[0].accesses;
  if (! accesses || accesses.length === 0) {
    //sharingList.innerHTML = '<small>No sharings, add one</small>'; 
    return;
  }
  resetTable('sharings-table'); // empty list
  for (const access of accesses) {
    await addListAccess(sharingTable, access);
  }
}

async function createSharing() {
  const checkBaby = document.getElementById('check-baby').checked;
  const checkBP = document.getElementById('check-bp').checked;
  if (! checkBP && ! checkBaby) { 
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
  if (checkBaby) permissions.push({streamId: 'baby-body', level: 'read'});
  if (checkBP) permissions.push({ streamId: 'heart', level: 'read' });

  const res = await connection.api([
    { 
      method: 'accesses.create', 
      params: {
        name: name,
        permissions: permissions
      }
  }]);
  if (res[0].error) {
    alert(JSON.stringify(res[0].error, null, 2));
    return;
  }
  updateSharings();
}

async function addListAccess(table, access) {
  
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
  await connection.api([{method: 'accesses.delete', params: {id: accessId}}]);
  updateSharings();
}