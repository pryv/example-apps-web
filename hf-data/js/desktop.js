let drawingCtx, renderCtx, drawingField;

const SIZE_DOT = 3;
const RED_COMPONENT = 255;
const GREEN_COMPONENT = 0;
const BLUE_COMPONENT = 0;
const ALPHA_COMPONENT = 255;

function buildDesktop() {
  const imageSelector = document.getElementById('image-selector');
  imageSelector.addEventListener('change', setBackgroundImage);

  drawingField = document.getElementById('drawing-field');
  drawingField.style.backgroundImage = "url('" + imageSelector.value + "')";
  drawingField.addEventListener('mousedown', mouseDown, false);
  drawingField.addEventListener('mousemove', mouseMove, false);

  const drawingCanvas = document.getElementById('drawing-canvas');
  if (drawingCanvas.getContext) {
    drawingCtx = drawingCanvas.getContext('2d');
  }

  renderCanvas = document.getElementById('render-canvas');
  if (renderCanvas.getContext) {
    renderCtx = renderCanvas.getContext('2d');
  }
  frequencyMouse = document.getElementById('frequency-mouse');
}

function setBackgroundImage() {
  const selection = document.getElementById('image-selector').value;
  drawingField.style.backgroundImage = 'url(' + selection + ')';
  clearCtx(drawingCtx);
}

function mouseDown(e) {
  if (!pryvHF.pryvConn) {
    alert('Please connect first to your Pryv account!');
    return;
  }
  const now = Date.now() / 1000;
  if (!is_recording) {
    clearCtx(drawingCtx);
    clearCtx(renderCtx);
    newEvent(pryvHF.pryvConn, false);
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
    drawDot(renderCtx, x, y, SIZE_DOT);
  }
}

function drawDot(ctx, x, y, size) {
  // Select a fill style
  ctx.fillStyle =
    'rgba(' +
    RED_COMPONENT +
    ',' +
    GREEN_COMPONENT +
    ',' +
    BLUE_COMPONENT +
    ',' +
    ALPHA_COMPONENT / 255 +
    ')';

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