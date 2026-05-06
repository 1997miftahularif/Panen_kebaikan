const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");

let drawing = false;
let lastX = 0;
let lastY = 0;
let mode = "pen";

let canvasWidth = 0;
let canvasHeight = 0;

let history = [];
let step = -1;

// ================= UI ACTIVE =================
function setActive(btn) {
  penBtn.classList.remove("active");
  eraserBtn.classList.remove("active");
  btn.classList.add("active");
}

function setPen() {
  mode = "pen";
  setActive(penBtn);
}

function setEraser() {
  mode = "eraser";
  setActive(eraserBtn);
}

// ================= CANVAS =================
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvasWidth = window.innerWidth - 70;
  canvasHeight = window.innerHeight - 60;

  const temp = canvas.toDataURL();

  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  if (temp) {
    let img = new Image();
    img.src = temp;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    };
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ================= DRAW =================
function setBrushStyle() {
  ctx.lineWidth = parseInt(brushSize.value);
  ctx.lineCap = "round";

  if (mode === "pen") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = colorPicker.value;
  } else {
    ctx.globalCompositeOperation = "destination-out";
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;

  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;

  setBrushStyle();
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;

  const pos = getPos(e);

  setBrushStyle();

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
});

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);

function stopDrawing() {
  if (!drawing) return;
  drawing = false;
  ctx.beginPath();
  saveState();
}

// ================= TOOLS =================
function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  saveState();
}

function saveImage() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "design.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ================= HISTORY =================
function saveState() {
  step++;
  if (step < history.length) {
    history.length = step;
  }
  history.push(canvas.toDataURL());
}

function restoreState(data) {
  let img = new Image();
  img.src = data;
  img.onload = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
  };
}

function undo() {
  if (step <= 0) return;
  step--;
  restoreState(history[step]);
}

function redo() {
  if (step >= history.length - 1) return;
  step++;
  restoreState(history[step]);
}

// INIT
setPen();
saveState();
