let container;
let serviceInfoSelect,
    serviceInfoInput,
    serviceInfo,
    service;

let drawingField,
    mouseTracker,
    is_display_current_canvas,
    renderCanvas,
    renderCtx,
    drawingCanvas,
    drawingCtx,
    hiddenCanvas,
    hiddenCtx,
    frequencyMouse,
    mouseImagesCounter;

let accelerometerCanvas,
    accelerometerRecordCounter,
    accelerometerButtonShow,
    recordSelect,
    frequencyAccelerometer;

let rendererCollect,
    cubeCollect,
    edgesCollect,
    sceneCollect,
    cameraCollect;

let rendererVisu,
    cubeVisu,
    edgesVisu,
    sceneVisu,
    cameraVisu;

let sharing,
    selectionData;

var cubeAlphaCollect = 0;
var cubeGammaCollect = 0;
var cubeBetaCollect = 0;

var cubeAlphaVisu = 0;
var cubeGammaVisu = 0;
var cubeBetaVisu = 0;

var currentRecording = [];

var pryvHF = {
    pryvConn: null,
    measures: {
        mouseX: {
            event: null,
            buffer: []
        },
        mouseY: {
            event: null,
            buffer: []
        },
        orientationGamma: {
            event: null,
            buffer: []
        },
        orientationBeta: {
            event: null,
            buffer: []
        },
        orientationAlpha: {
            event: null,
            buffer: []
        }
    }

};

let fromTime = 0;
let samplePostMs = 100;
let delayIfEmptyBatch = 1000;
let images = [];
let recordings = [];
let image_index = -1;
let isMobile = 0;
let is_recording;
let length_last_batch;
let pointsSecondMouse = 0;
let pointsSecondAccelerometer = 0;

const samplingAccRate = 30;

const IMAGE_START = -1000;
const IMAGE_END = -2000;

const SIZE_DOT = 3;
const RED_COMPONENT = 255;
const GREEN_COMPONENT = 0;
const BLUE_COMPONENT = 0;
const ALPHA_COMPONENT = 255;

window.onload = (event) => {
    mouseTracker = document.getElementById('mouse-tracker');
    mouseVisu = document.getElementById('mouse-visualization');
    accelerometerCollector = document.getElementById('accelerometer-collect');
    accelerometerVisu = document.getElementById('accelerometer-visualization');
    sharing = document.getElementById('create-sharing');
    selectionData = document.getElementById('selection-data');
    container = document.getElementById('container');

    frequency();
    let queryString = window.location.search;
    if (queryString) {
        const urlParams = new URLSearchParams(queryString);
        const apiEndpoint = urlParams.get('apiEndpoint');
        if (apiEndpoint) {
            buildVisualizationOnly(apiEndpoint, urlParams);
            return;
        }
    }
    buildServiceInfo();

    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }

    if (isMobile) {
        buildMobile();
    } else {
        buildDesktop();
    }
    selectionData.style.display = "none";
    sharing.addEventListener("click", createSharing);
    fetch();
    fetchServiceInfo();
    samplePost();
};

/* Connect to the service */
function buildServiceInfo() {
    serviceInfoSelect = document.getElementById('service-info-select');
    serviceInfoInput = document.getElementById('service-info-text');
    serviceInfoSelect.addEventListener('change', setServiceInfo);
    document.getElementById('fetch-service-info-button').addEventListener('click', fetchServiceInfo);
}

function setServiceInfo() {
    const selection = document.getElementById('service-info-select').value;
    serviceInfoInput.value = selection;
}

async function fetchServiceInfo() {
    service = new Pryv.Service(serviceInfoInput.value);
    serviceInfo = await service.info();
    authRequest()
}

async function authRequest() {
    Pryv.Browser.setupAuth(authSettings, serviceInfoInput.value);
}

const authSettings = {
    spanButtonID: 'pryv-button', // span id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: { // See: https://api.pryv.com/reference/#auth-request
        requestingAppId: 'app-web-hfdemo', // to customize for your own app
        requestedPermissions: [{
            streamId: 'hf',
            defaultName: 'HF',
            level: 'manage' // permission for the app to manage data in the stream 'Health'
        }],
        requestingAppId: 'app-web-hfdemo',
    }
};

async function pryvAuthStateChange(state) { // called each time the authentication state changes
    console.log('##pryvAuthStateChange', state);
    if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
        console.log(state);
        var connection = new Pryv.Connection(state.apiEndpoint);

        await setupConnection(connection);
        updateSharings();
        displayDiv(true);
    }
    if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
        pryvHF.pryvConn = null;
        connection = null;
        displayDiv(false);
    }
    function displayDiv(isDisplay) {
        let display = isDisplay ? "" : "none";
        if (isMobile) {
            accelerometerCollector.style.display = display;
            accelerometerVisu.style.display = display;
        }
        else {
            mouseTracker.style.display = display;
            mouseVisu.style.display = display;
        }
        document.getElementById('sharing-view').style.display = display;
    }
}

/* Build Desktop version */
function buildDesktop() {
    is_display_current_canvas = true;
    imageSelector = document.getElementById('image-selector');
    imageSelector.addEventListener('change', setBackgroundImage);

    drawingField = document.getElementById('drawing-field');
    drawingField.style.backgroundImage = "url('" + imageSelector.value + "')";
    drawingField.addEventListener('mousedown', mouseDown, false);
    drawingField.addEventListener('mousemove', mouseMove, false);

    drawingCanvas = document.getElementById('drawing-canvas');
    if (drawingCanvas.getContext) {
        drawingCtx = drawingCanvas.getContext('2d');
    }

    renderCanvas = document.getElementById('render-canvas');
    if (renderCanvas.getContext) {
        renderCtx = renderCanvas.getContext('2d');
    }

    hiddenCanvas = createCanvas(drawingCanvas.width, drawingCanvas.height);
    if (hiddenCanvas.getContext) {
        hiddenCtx = hiddenCanvas.getContext('2d');
    }

    button_current = document.getElementById('current');
    button_current.addEventListener('click', current_context);
    changeColorCurrentButton();

    button_previous = document.getElementById('previous');
    button_previous.addEventListener('click', previousImage);

    button_next = document.getElementById('next');
    button_next.addEventListener('click', nextImage);

    frequencyMouse = document.getElementById('frequency-mouse');
    mouseImagesCounter = document.getElementById('counter-mouse');

}

function changeColorCurrentButton() {
    if (is_display_current_canvas) {
        button_current.style.backgroundColor = "grey";
        button_current.style.color = "black";
    } else {
        button_current.style.backgroundColor = "#F0F0F0";
        button_current.style.color = "black";
    }
}

function setBackgroundImage() {
    const selection = document.getElementById('image-selector').value;
    drawingField.style.backgroundImage = 'url(' + selection + ')'
    clearCtx(drawingCtx)
}

function mouseDown(e) {
    if (!pryvHF.pryvConn) {
        alert("Please connect first to your Pryv account!");
        return;
    }
    var now = Date.now() / 1000;
    if (is_recording) {
        //Add point to indicate the end of a drawing
        pryvHF.measures.mouseX.buffer.push([now, IMAGE_END]);
        pryvHF.measures.mouseY.buffer.push([now, IMAGE_END]);
    } else {
        //Add point to indicate the beggining of a drawing
        pryvHF.measures.mouseX.buffer.push([now, IMAGE_START]);
        pryvHF.measures.mouseY.buffer.push([now, IMAGE_START]);
    }
    is_recording = !is_recording;
}

function mouseMove(e) {
    if (is_recording) {
        var now = Date.now() / 1000;
        pryvHF.measures.mouseX.buffer.push([now, e.offsetX]);
        pryvHF.measures.mouseY.buffer.push([now, e.offsetY]);
        drawDot(drawingCtx, e.offsetX, e.offsetY, SIZE_DOT);
    }
}

function draw(pointsX, pointsY, length) {
    for (let i = 0; i < length; i++) {
        x = pointsX[i][1];
        y = pointsY[i][1];
        if (x == IMAGE_END && y == IMAGE_END) {
            createNewImage();
        } else if (x == IMAGE_START && y == IMAGE_START) {
            clearCtx(hiddenCtx);
            if (is_display_current_canvas) {
                clearCtx(renderCtx);
            }
        } else {
            if (is_display_current_canvas) {
                drawDot(renderCtx, x, y, SIZE_DOT);
            }
            drawDot(hiddenCtx, x, y, SIZE_DOT);
        }
    }
}

function drawDot(ctx, x, y, size) {
    // Select a fill style
    ctx.fillStyle = "rgba(" + RED_COMPONENT + "," + GREEN_COMPONENT + "," + BLUE_COMPONENT + "," + (ALPHA_COMPONENT / 255) + ")";

    // Draw a filled circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function clearCtx(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function createCanvas(width, height) {
    var c = document.createElement('canvas');
    c.setAttribute('width', width);
    c.setAttribute('height', height);
    return c;
}

function current_context() {
    is_display_current_canvas = true;
    changeColorCurrentButton();
    clearCtx(renderCtx);
    renderCtx.drawImage(hiddenCanvas, 0, 0);
}

function createNewImage() {
    var i = hiddenCanvas.toDataURL();
    var img = new Image();
    img.src = i;
    images.push(img);
    mouseImagesCounter.innerHTML = 'Number of stored images: ' + images.length;
}

function previousImage() {
    displayImage(true);
}

function nextImage() {
    displayImage(false);
}

function displayImage(is_previous) {
    is_display_current_canvas = false;
    changeColorCurrentButton();
    index(is_previous);
    clearCtx(renderCtx);
    if (image_index >= 0) {
        renderCtx.drawImage(images[image_index], 0, 0);
    }
}

function index(is_previous) {
    if (images.length == 0) {
        image_index = -1;
    } else {
        if (image_index == -1) {
            image_index = 0;
        }
        if (is_previous) {
            let tmp = image_index - 1;
            image_index = tmp < 0 ? images.length - 1 : tmp;
        } else {
            let tmp = image_index + 1;
            image_index = tmp >= images.length ? 0 : tmp;
        }
    }
}


/* Build mobile version */
function buildMobile() {
    accelerometerCanvas = document.getElementById('accelerometer-canvas');
    [sceneCollect, cameraCollect, rendererCollect, cubeCollect, edgesCollect] = create3DCanvas(accelerometerCanvas);
    animateCollect();

    accelerometerButton = document.getElementById('accelerometer-button');
    accelerometerButton.addEventListener('click', samplingButton);

    window.addEventListener('deviceorientation', deviceorientation, false);

    accelerometerVisuCanvas = document.getElementById('accelerometer-visualization-canvas');
    [sceneVisu, cameraVisu, rendererVisu, cubeVisu, edgesVisu] = create3DCanvas(accelerometerVisuCanvas);
    animateVisu();

    accelerometerRecordCounter = document.getElementById('counter-accelerometer');
    accelerometerButtonShow = document.getElementById('accelerometer-show');
    accelerometerButtonShow.addEventListener('click', showRecording);

    recordSelect = document.getElementById('recording-select');

    frequencyAccelerometer = document.getElementById('frequency-accelerometer');
}

function samplingButton(e) {
    if (!pryvHF.pryvConn) {
        alert("Please connect first to your Pryv account!");
        return;
    }
    var now = Date.now() / 1000;
    if (is_recording) {
        //Add point to indicate the end of a drawing
        pryvHF.measures.orientationGamma.buffer.push([now, IMAGE_END]);
        pryvHF.measures.orientationBeta.buffer.push([now, IMAGE_END]);
        pryvHF.measures.orientationAlpha.buffer.push([now, IMAGE_END]);
    } else {
        //Add point to indicate the beggining of a drawing
        pryvHF.measures.orientationGamma.buffer.push([now, IMAGE_START]);
        pryvHF.measures.orientationBeta.buffer.push([now, IMAGE_START]);
        pryvHF.measures.orientationAlpha.buffer.push([now, IMAGE_START]);
    }
    is_recording = !is_recording;
}

function deviceorientation(event) {
    if (is_recording) {
        var now = Date.now() / 1000;
        cubeAlphaCollect = THREE.Math.degToRad(event.alpha);
        cubeGammaCollect = THREE.Math.degToRad(event.gamma);
        cubeBetaCollect = THREE.Math.degToRad(event.beta);
        pryvHF.measures.orientationGamma.buffer.push([now, event.gamma]);
        pryvHF.measures.orientationBeta.buffer.push([now, event.beta]);
        pryvHF.measures.orientationAlpha.buffer.push([now, event.alpha]);
    }
}

function create3DCanvas(canvasProperty) {
    // Setting scene for 3D Object
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
        75,
        0.5349182763744428,
        0.1,
        1000
    );
    var renderer = new THREE.WebGLRenderer({ canvas: canvasProperty });

    var geometry = new THREE.BoxGeometry(3, 1.5, 0.5);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);


    var edges = new THREE.EdgesGeometry(geometry);
    edges = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0000ff }));
    scene.add(edges);
    camera.position.z = 5;
    return [scene, camera, renderer, cube, edges];
}

function animateCollect() {
    requestAnimationFrame(animateCollect);
    edgesCollect.rotation.x = cubeBetaCollect;
    edgesCollect.rotation.y = cubeGammaCollect;
    edgesCollect.rotation.z = cubeAlphaCollect;
    cubeCollect.rotation.x = cubeBetaCollect;
    cubeCollect.rotation.y = cubeGammaCollect;
    cubeCollect.rotation.z = cubeAlphaCollect;
    rendererCollect.render(sceneCollect, cameraCollect);
}

function animateVisu() {
    requestAnimationFrame(animateVisu);
    edgesVisu.rotation.x = cubeBetaVisu;
    edgesVisu.rotation.y = cubeGammaVisu;
    edgesVisu.rotation.z = cubeAlphaVisu;
    cubeVisu.rotation.x = cubeBetaVisu;
    cubeVisu.rotation.y = cubeGammaVisu;
    cubeVisu.rotation.z = cubeAlphaVisu;
    rendererVisu.render(sceneVisu, cameraVisu);
}

function recordAccelerometer(pointsAlpha, pointsBeta, pointsGamma, l) {
    for (let i = 0; i < l; i++) {
        if (pointsAlpha[i] != IMAGE_START && pointsAlpha[i] != IMAGE_END) {
            currentRecording.push([pointsAlpha[i], pointsBeta[i], pointsGamma[i]]);
        } else if (pointsAlpha[i] == IMAGE_START) {
            currentRecording = [];
        } else if (pointsAlpha[i] == IMAGE_END) {
            //Add option to the select
            let index = recordings.length;
            let opt = document.createElement('option');
            opt.appendChild(document.createTextNode('Recording ' + index));
            opt.value = index;
            recordSelect.appendChild(opt);

            // Push new recording in images
            recordings.push(currentRecording);
            accelerometerRecordCounter.innerHTML = 'Number of stored recordings: ' + recordings.length;
        }
    }
}

function showRecording() {
    let selected = recordSelect.value;
    if (selected == "") {
        alert('No recording available');
        return;
    }
    let time = 0;
    let recording = recordings[selected];
    for (let i = 0; i < recording.length; i++) {
        let point = recording[i];
        time = samplingAccRate * i;
        setTimeout(() => {
            cubeAlphaVisu = point[0];
            cubeBetaVisu = point[1];
            cubeGammaVisu = point[2];
        }, time);
    }
}

/* Visualization only */
async function buildVisualizationOnly(apiEndpoint, urlParams) {
    pryvHF.pryvConn = new Pryv.Connection(apiEndpoint);
    let eventsList = await getEventList();
    populateCollectionTable(eventsList);
    const username = await pryvHF.pryvConn.username();
    document.getElementById("name-selection").innerHTML = "Data Collection Of " + username;
    const eventId_mouseX = urlParams.get('posXEventId');
    const eventId_mouseY = urlParams.get('posYEventId');
    if (eventId_mouseX && eventId_mouseY) {
        pryvHF.measures.mouseX.event = {
            "id": eventId_mouseX
        };
        pryvHF.measures.mouseY.event = {
            "id": eventId_mouseY
        };
        buildDesktop();
        mouseVisu.style.display = "";
    }
    const eventId_alpha = urlParams.get('angleAEventId');
    const eventId_beta = urlParams.get('angleBEventId');
    const eventId_gamma = urlParams.get('angleYEventId');
    if (eventId_alpha && eventId_beta && eventId_gamma) {
        pryvHF.measures.orientationAlpha.event = {
            "id": eventId_alpha
        };
        pryvHF.measures.orientationBeta.event = {
            "id": eventId_beta
        };
        pryvHF.measures.orientationGamma.event = {
            "id": eventId_gamma
        };
        buildMobile();
        accelerometerVisu.style.display = "";
    }
    document.getElementById('service').style.display = "none";
    mouseTracker.style.display = "none";
    accelerometerCollector.style.display = "none";
    sharing.style.display = "none";
    fetch();


    async function getEventList() {
        let eventsList = [];
        const params = {
            fromTime: 0
        }
        let events;
        try {
            events = (await pryvHF.pryvConn.get('events', params)).events;
        } catch (e) {
            container.style.display = "none";
            alert('Endpoint incorrect')
            return;
        }
        for (let i = 0; i < events.length; i++) {
            if (events[i].streamId == "hfdemo-mouse-y") {
                eventsList.push({
                    date: events[i].created,
                    mouseX: events[i + 1].id,
                    mouseY: events[i].id
                });
                i += 1;
            }
            else {
                eventsList.push({
                    date: events[i].created,
                    alpha: events[i].id,
                    beta: events[i + 1].id,
                    gamma: events[i + 2].id
                });

                i += 2;
            }
        }
        return eventsList;
    }
}


/* Handle connection with Pryv */
async function setupConnection(connection) {
    // A- retrieve previously created events or create events holders
    var postData;
    var resultTreatment = [];
    var postData = [];
    var streams = (await connection.get('streams', null)).streams;
    let [hasHF, hasDesktop, hasMobile] = isInStreams(streams);
    if (!hasHF) {
        postData.push(
            {
                method: 'streams.create',
                params: {
                    id: 'hfdemo',
                    name: 'HF Demo',
                    parentId: 'hf'
                }
            },
        );
        resultTreatment.push(null);
    }
    if (isMobile) {
        if (!hasMobile) {
            postData.push(
                // Accelerometer
                {
                    method: 'streams.create',
                    params: {
                        id: 'hfdemo-orientation-gamma',
                        name: 'Orientation-Gamma',
                        parentId: 'hfdemo'
                    }
                },
                {
                    method: 'streams.update',
                    params: {
                        id: 'hfdemo-orientation-gamma',
                        update: {
                            clientData: stdPlotly('Orientation', 'angle/deg', 'Gamma')
                        }
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-gamma',
                        type: 'series:angle/deg',
                        description: 'Holder for device gamma'
                    }
                },
                {
                    method: 'streams.create',
                    params: {
                        id: 'hfdemo-orientation-beta',
                        name: 'Orientation-Beta',
                        parentId: 'hfdemo'
                    }
                },
                {
                    method: 'streams.update',
                    params: {
                        id: 'hfdemo-orientation-beta',
                        update: {
                            clientData: stdPlotly('Orientation', 'angle/deg', 'Beta')
                        }
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-beta',
                        type: 'series:angle/deg',
                        description: 'Holder for device beta'
                    }
                },
                {
                    method: 'streams.create',
                    params: {
                        id: 'hfdemo-orientation-alpha',
                        name: 'Orientation-Alpha',
                        parentId: 'hfdemo'
                    }
                },
                {
                    method: 'streams.update',
                    params: {
                        id: 'hfdemo-orientation-alpha',
                        update: {
                            clientData: stdPlotly('Orientation', 'angle/deg', 'Alpha')
                        }
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-alpha',
                        type: 'series:angle/deg',
                        description: 'Holder for device alpha'
                    }
                }
            );

            resultTreatment.push(
                null,
                null,
                function handleCreateEventGamma(result) {
                    pryvHF.measures.orientationGamma.event = result.event;
                    console.log('handle gammaEvent set', result.event);
                },
                null,
                null,
                function handleCreateEventBeta(result) {
                    pryvHF.measures.orientationBeta.event = result.event;
                    console.log('handle betaEvent set', result.event);
                },
                null,
                null,
                function handleCreateEventAlpha(result) {
                    pryvHF.measures.orientationAlpha.event = result.event;
                    console.log('handle alphaEvent set', result.event);
                }
            );
        } else {
            postData.push(
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-gamma',
                        type: 'series:angle/deg',
                        description: 'Holder for device gamma'
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-beta',
                        type: 'series:angle/deg',
                        description: 'Holder for device beta'
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-orientation-alpha',
                        type: 'series:angle/deg',
                        description: 'Holder for device alpha'
                    }
                }
            );
            resultTreatment.push(
                function handleCreateEventGamma(result) {
                    pryvHF.measures.orientationGamma.event = result.event;
                    console.log('handle gammaEvent set', result.event);
                },
                function handleCreateEventBeta(result) {
                    pryvHF.measures.orientationBeta.event = result.event;
                    console.log('handle betaEvent set', result.event);
                },
                function handleCreateEventAlpha(result) {
                    pryvHF.measures.orientationAlpha.event = result.event;
                    console.log('handle alphaEvent set', result.event);
                }
            );
        }

    } else {
        if (!hasDesktop) {
            postData.push(
                // MOUSE
                {
                    method: 'streams.create',
                    params: {
                        id: 'hfdemo-mouse-x',
                        name: 'Mouse-X',
                        parentId: 'hfdemo'
                    }
                },
                {
                    method: 'streams.update',
                    params: {
                        id: 'hfdemo-mouse-x',
                        update: {
                            clientData: stdPlotly('Mouse', 'count/generic', 'X')
                        }
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-mouse-x',
                        type: 'series:count/generic',
                        description: 'Holder for x mouse position',
                    }
                },
                {
                    method: 'streams.create',
                    params: {
                        id: 'hfdemo-mouse-y',
                        name: 'Mouse-Y',
                        parentId: 'hfdemo'
                    }
                },
                {
                    method: 'streams.update',
                    params: {
                        id: 'hfdemo-mouse-y',
                        update: {
                            clientData: stdPlotly('Mouse', 'count/generic', 'Y')
                        }
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-mouse-y',
                        type: 'series:count/generic',
                        description: 'Holder for y mouse position',
                    }
                }
            );

            resultTreatment.push(
                null,
                null,
                function handleCreateEventX(result) {
                    pryvHF.measures.mouseX.event = result.event;

                    console.log('handle xEvent set', result.event);
                },
                null,
                null,
                function handleCreateEventY(result) {
                    pryvHF.measures.mouseY.event = result.event;
                    console.log('handle yEvent set', result.event);
                }
            );
        } else {
            postData.push(
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-mouse-x',
                        type: 'series:count/generic',
                        description: 'Holder for x mouse position',
                    }
                },
                {
                    method: 'events.create',
                    params: {
                        streamId: 'hfdemo-mouse-y',
                        type: 'series:count/generic',
                        description: 'Holder for y mouse position',
                    }
                }
            );
            resultTreatment.push(
                function handleCreateEventX(result) {
                    pryvHF.measures.mouseX.event = result.event;
                    console.log('handle xEvent set', result.event);
                },
                function handleCreateEventY(result) {
                    pryvHF.measures.mouseY.event = result.event;
                    console.log('handle yEvent set', result.event);
                }
            );
        }
    }

    const result = connection.api(postData);
    result.then((result, err, resultInfo) => {
        if (err) { return console.log('...error: ' + JSON.stringify([err, result])); }
        console.log('...event created: ' + JSON.stringify(result));
        if (result) {
            for (var i = 0; i < result.length; i++) {
                if (resultTreatment[i]) {
                    resultTreatment[i].call(null, result[i]);
                }
            }
        } else {
            console.log(' No result!!', resultInfo);
        }
    });
    pryvHF.pryvConn = connection;

    function isInStreams(streams) {
        let hasDesktop = false;
        let hasMobile = false;
        let hasTop = false;
        if (streams.length == 0) {
            return [hasTop, hasDesktop, hasMobile];
        }
        streams = streams[0].children.filter(x => x.id == "hfdemo");
        if (streams.length == 0) {
            return [hasTop, hasDesktop, hasMobile];
        }
        hasTop = true;
        hasDesktop = streams[0].children.filter(x => x.name == "Mouse-X").length;
        hasMobile = streams[0].children.filter(x => x.name == "Orientation-Alpha").length;
        return [hasTop, hasDesktop, hasMobile];
    }
}

function stdPlotly(key, type, name) {
    var data = {};
    data[type] = {
        plotKey: key,
        trace: {
            type: 'scatter',
            name: name,
            mode: 'lines',
            connectgaps: 0
        }
    }
    return { 'app-web-plotly': data };
}

function samplePost() {
    if (pryvHF.pryvConn) {
        postBatch(pryvHF.pryvConn, pryvHF.measures);
    }
    setTimeout(samplePost, samplePostMs);
}

function postBatch(connection, measures) {
    for (var key in measures) {
        let bufferLength = measures[key].buffer.length;
        if (measures[key].event && bufferLength > 0) {
            var points = measures[key].buffer;
            connection.addPointsToHFEvent(measures[key].event.id, measures[key].event.content.fields, points);
            // Reset local buffer
            measures[key].buffer = []
        }
    }
}

/* Pull info from Pryv */
async function fetch() {
    if (pryvHF.pryvConn) {
        length_last_batch = 0;
        if (pryvHF.measures.mouseX.event) {
            await fetchSerieMouse();
        }
        if (pryvHF.measures.orientationGamma.event) {
            await fetchSerieAccelerometer();
        }
    }
    if (length_last_batch) {
        fetch()
    } else {
        setTimeout(fetch, delayIfEmptyBatch);
    }
}

async function fetchSerieMouse() {
    let queryParams = {
        fromDeltaTime: (fromTime + 0.0001)
    }
    let pathX = 'events/' + pryvHF.measures.mouseX.event.id + '/series';
    let pathY = 'events/' + pryvHF.measures.mouseY.event.id + '/series';
    let resultX = pryvHF.pryvConn.get(pathX, queryParams);
    let resultY = pryvHF.pryvConn.get(pathY, queryParams);
    try {
        await Promise.all([resultX, resultY]).then(([pointsX, pointsY]) => {
            let l = Math.min(pointsX.points.length, pointsY.points.length);
            length_last_batch += l;
            pointsSecondMouse += l;
            let lastValue = pointsX.points[l - 1];
            if (lastValue) {
                fromTime = pointsX.points[l - 1][0];
                draw(pointsX.points, pointsY.points, l);
            }
        });
    } catch (error) {
        container.style.display = "none";
        alert("Error to fetch data");
    }
}

async function fetchSerieAccelerometer() {
    let queryParams = {
        fromDeltaTime: (fromTime + 0.0001)
    }
    let pathGamma = 'events/' + pryvHF.measures.orientationGamma.event.id + '/series';
    let pathBeta = 'events/' + pryvHF.measures.orientationBeta.event.id + '/series';
    let pathAlpha = 'events/' + pryvHF.measures.orientationAlpha.event.id + '/series';
    let resultGamma = pryvHF.pryvConn.get(pathGamma, queryParams);
    let resultBeta = pryvHF.pryvConn.get(pathBeta, queryParams);
    let resultAlpha = pryvHF.pryvConn.get(pathAlpha, queryParams);
    try {
        await Promise.all([resultGamma, resultBeta, resultAlpha]).then(([pointsGamma, pointsBeta, pointsAlpha]) => {
            let l = Math.min(pointsGamma.points.length, pointsBeta.points.length, pointsAlpha.points.length);
            length_last_batch += l;
            pointsSecondAccelerometer += l;
            if (l) {
                fromTime = pointsGamma.points[l - 1][0];
                pointsGamma = pointsGamma.points.map(([timestamp, x]) => {
                    if (x == IMAGE_START || x == IMAGE_END) {
                        return x;
                    }
                    return THREE.Math.degToRad(x)
                });
                pointsBeta = pointsBeta.points.map(([timestamp, x]) => {
                    if (x == IMAGE_START || x == IMAGE_END) {
                        return x;
                    }
                    return THREE.Math.degToRad(x)
                });
                pointsAlpha = pointsAlpha.points.map(([timestamp, x]) => {
                    if (x == IMAGE_START || x == IMAGE_END) {
                        return x;
                    }
                    return THREE.Math.degToRad(x);
                });
                recordAccelerometer(pointsAlpha, pointsBeta, pointsGamma, l);
            }
        });
    } catch (error) {
        container.style.display = "none";
        alert("Error to fetch data");
    }
}

function frequency() {
    if (pryvHF.pryvConn) {
        if (pryvHF.measures.mouseX.event) {
            frequencyMouse.innerHTML = "Fetch frequency: " + pointsSecondMouse + " points/s"
        }
        if (pryvHF.measures.orientationGamma.event) {
            frequencyAccelerometer.innerHTML = "Fetch frequency: " + pointsSecondAccelerometer + " points/s"
        }
        pointsSecondMouse = 0;
        pointsSecondAccelerometer = 0;
    }
    setTimeout(frequency, 1000);
}

// ----- Sharings

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

function populateCollectionTable(events) {
    const table = document.getElementById('data-collection');
    for (const event of events) {
        addListEvent(table, event);
    }
}

function addListEvent(table, event) {
    let link;
    const baseUrl = window.location.href.split('&')[0];
    if (event.mouseX) {
        link = '<a href="' + baseUrl + '&posXEventId=' + event.mouseX + '&posYEventId=' + event.mouseY + '">Desktop</a>';
    } else {
        link = '<a href="' + baseUrl + '&angleAEventId=' + event.alpha + '&angleBEventId=' + event.beta + '&angleYEventId=' + event.gamma + '">Mobile</a>';
    }
    const date = new Date(event.date * 1000);
    const row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = date.toUTCString();
    row.insertCell(-1).innerHTML = link;
}