// ----- Sharings
function buildSharing() {
    let sharing = document.getElementById('create-sharing');
    sharing.addEventListener("click", createSharing);
}

async function updateSharings() {
    const result = await pryvHF.pryvConn.api([ // https://github.com/pryv/lib-js#api-calls
        {
            method: 'accesses.get', // get accesses of the data: https://api.pryv.com/reference/#get-accesses
            params: {}
        }
    ]);
    const sharingTable = document.getElementById('sharings-table');
    const accesses = result[0].accesses;
    if (!accesses || accesses.length === 0) {
        return;
    }
    resetTable('sharings-table'); // empty list
    for (const access of accesses) {
        await addListAccess(sharingTable, access);
    }
}

async function createSharing() {
    const name = document.getElementById('sharing-name').value.trim();
    if (!name || name === '') {
        alert('Enter a name for your sharing');
        return;
    }
    // set permissions
    const permissions = [];
    permissions.push({ streamId: 'hfdemo', level: 'read' });

    const res = await pryvHF.pryvConn.api([ // https://github.com/pryv/lib-js#api-calls
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
    const username = await pryvHF.pryvConn.username();
    const apiEndpoint = await service.apiEndpointFor(username, access.token);

    const sharingURL = window.location.href.split('?')[0] + '?apiEndpoint=' + apiEndpoint;
    const sharingLink = '<a href="' + sharingURL + '" target="_new"> open </a>';

    const emailSubject = encodeURIComponent('Access my ' + permissions.join(', ') + ' data');
    const emailBody = encodeURIComponent('Hello,\n\nClick on the following link ' + sharingURL);

    const emailLink = '<a href="mailto:?subject=' + emailSubject + '&body=' + emailBody + '"> email </a>';

    const deleteLink = '<a href="" onclick="javascript:deleteSharing(\'' + access.id + '\');return false;">' + access.name + '</a>';

    const row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = deleteLink;
    row.insertCell(-1).innerHTML = sharingLink;
    row.insertCell(-1).innerHTML = emailLink;
};

async function deleteSharing(accessId) {
    if (!confirm('delete?')) return;
    await pryvHF.pryvConn.api([ // https://github.com/pryv/lib-js#api-calls
        {
            method: 'accesses.delete', // deletes the selected access: https://api.pryv.com/reference/#delete-access 
            params: { id: accessId }
        }
    ]);
    resetTable('sharings-table')
    updateSharings();
}

function resetTable(tableId) {
    const html = '<thead><tr><th scope="col">Name</th><th scope="col">Link</th><th scope="col">Mail</th></tr></thead>';
    var table = document.getElementById(tableId);
    table.innerHTML = html;
}