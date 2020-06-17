var connection = null;

var authSettings = {
  spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
  onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
  authRequest: { // See: https://api.pryv.com/reference/#auth-request
    requestingAppId: 'pryv-example-vue-and-share',
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
        'content': 'This sample app demonstrates how we can visualize and re-share data with an app-token.'
      }
    },
  }
};

function pryvAuthStateChange(state) { // called each time the authentication state changes
  console.log('##pryvAuthStateChange', state);
  if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    username = state.displayName; // (will be probably changed by username property)
    connection = new Pryv.Connection(state.apiEndpoint);
    loadData();
  }
  if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
    connection = null;
    resetData();
  }
}


var serviceInfoUrl = 'https://reg.pryv.me/service/info';
var service = null; // will be initialized after setupAuth;
var username = null; // will be inialized after AUTHORIZED auth State is recieved
window.onload = async (event) => {
  service = await Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
  // register "Create" sharing button event listener 
  document.getElementById('create-sharing').addEventListener("click", createSharing);
};


function resetData() {

}


async function loadData() {
  const result = await connection.api([{method: 'events.get', params: {limit: 40}}]);
  const events = result[0].events;
  if (! events || events.length === 0) {
    alert('There is no data to show. Use the example "simple-form" first');
    return;
  }
  // grab data lists
  const babyDataList = document.getElementById('baby-weight');
  const heartDataList = document.getElementById('blood-pressure');
  for (const event of events) {
    if (event.streamIds.includes('baby-body') && event.type === 'mass/kg') {
      addListEvent(babyDataList, event, event.content + ' Kg');
    }
    if (event.streamIds.includes('heart') && event.type === 'blood-pressure/mmhg-bpm') {
      addListEvent(heartDataList, event, 'S: ' + 
      event.content.systolic + 'mmHg - D:' +
      event.content.diastolic + 'mmHg');
    }
  }
  updateSharings();
}

function addListEvent(list, event, text) {
  const date = new Date(event.time * 1000);
  const dateText = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear()
    + ' ' + date.getHours() + ':' + date.getMinutes();
  const node = document.createElement("LI");
  const textnode = document.createTextNode(dateText + ' - ' + text);
  node.appendChild(textnode);
  list.appendChild(node);
};

// ----- sharings

async function updateSharings() {
  const result = await connection.api([{ method: 'accesses.get', params: {}}]);
  const sharingList = document.getElementById('sharings');
  console.log(result);
  const accesses = result[0].accesses;
  if (! accesses || accesses.length === 0) {
    sharingList.innerHTML = '<small>No sharings, add one</small>'; 
    return;
  }
  sharingList.innerHTML = ''; // empty list
  for (const access of accesses) {
    await addListAccess(sharingList, access);
  }
}

async function createSharing() {
  const checkBaby = document.getElementById('check-baby').checked;
  const checkBP = document.getElementById('check-bp').checked;
  if (! checkBP && ! checkBaby) { 
    alert('Check at least one of Baby or Blood');
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

async function addListAccess(list, access) {
  const node = document.createElement("LI");
  
  const permissions = [];
  for (const permission of access.permissions) permissions.push(permission.streamId);
  const apiEndpoint = await service.apiEndpointFor(username, access.token);

  const sharingURL = window.location.href.split('?')[0] + '?pryvApiEndPoint=' + apiEndpoint;
  const sharingLink = '<a href="' + sharingURL + '" target="_new"> open </a>';

  const emailSubject = encodeURIComponent('Access my ' + permissions.join(', ') + ' data');
  const emailBody = encodeURIComponent('Hello,\n\nClick on the following link ' + sharingURL);

  const emailLink = '<a href="mailto:?subject=' + emailSubject + '&body=' + emailBody + '"> email </a>';

  const deleteLink = '<a href="" onclick="javascript:deleteSharing(\'' + access.id + '\');return false;">' + access.name + '</a>';

  const html = deleteLink + ': [' + permissions.join(', ') + '] ' + sharingLink + ' - ' + emailLink;
  //const textnode = document.createHTMLNode(text);
  node.innerHTML = html;
  list.appendChild(node);
};

async function deleteSharing(accessId) {
  if (! confirm('delete?')) return;
  await connection.api([{method: 'accesses.delete', params: {id: accessId}}]);
  updateSharings();
}