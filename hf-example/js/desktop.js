let drawingCtx, renderCtx, hiddenCtx, drawingField;
let button_current, is_display_current_canvas;
let mouseImagesCounter;

const images = [];
let image_index = -1;

const SIZE_DOT = 3;
const RED_COMPONENT = 255;
const GREEN_COMPONENT = 0;
const BLUE_COMPONENT = 0;
const ALPHA_COMPONENT = 255;

function buildDesktop() {
    is_display_current_canvas = true;
    let imageSelector = document.getElementById('image-selector');
    imageSelector.addEventListener('change', setBackgroundImage);

    drawingField = document.getElementById('drawing-field');
    drawingField.style.backgroundImage = "url('" + imageSelector.value + "')";
    drawingField.addEventListener('mousedown', mouseDown, false);
    drawingField.addEventListener('mousemove', mouseMove, false);

    let drawingCanvas = document.getElementById('drawing-canvas');
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

    let button_previous = document.getElementById('previous');
    button_previous.addEventListener('click', previousImage);

    let button_next = document.getElementById('next');
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
    const now = Date.now() / 1000;
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
        const now = Date.now() / 1000;
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
    let c = document.createElement('canvas');
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
    let i = hiddenCanvas.toDataURL();
    let img = new Image();
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

/* Set the index of the next image to show */
function index(is_previous) {
    if (images.length == 0) {
        image_index = -1;
    } else {
        if (image_index == -1) {
            image_index = 0;
        }
        if (is_previous) {
            const tmp = image_index - 1;
            image_index = tmp < 0 ? images.length - 1 : tmp;
        } else {
            const tmp = image_index + 1;
            image_index = tmp >= images.length ? 0 : tmp;
        }
    }
}