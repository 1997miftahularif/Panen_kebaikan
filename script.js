const canvasContainer = document.getElementById("canvasContainer");
const layersList = document.getElementById("layersList");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");

let layers = [];
let activeLayer = null;

let drawing = false;
let mode = "pen";

let canvasWidth = 0;
let canvasHeight = 0;

// ================= ACTIVE BUTTON =================
function setActive(btn){

  penBtn.classList.remove("active");
  eraserBtn.classList.remove("active");

  btn.classList.add("active");
}

function setPen(){

  mode = "pen";
  setActive(penBtn);
}

function setEraser(){

  mode = "eraser";
  setActive(eraserBtn);
}

// ================= RESIZE =================
function resizeCanvas(){

  canvasWidth = window.innerWidth - 320;
  canvasHeight = window.innerHeight - 60;

  layers.forEach(layer => {

    const temp = document.createElement("canvas");
    temp.width = layer.canvas.width;
    temp.height = layer.canvas.height;

    temp.getContext("2d").drawImage(layer.canvas, 0, 0);

    layer.canvas.width = canvasWidth;
    layer.canvas.height = canvasHeight;

    layer.canvas.style.width = canvasWidth + "px";
    layer.canvas.style.height = canvasHeight + "px";

    layer.ctx.drawImage(temp, 0, 0);
  });
}

window.addEventListener("resize", resizeCanvas);

// ================= LAYER =================
function addLayer(name = null){

  const canvas = document.createElement("canvas");
  canvas.className = "layer-canvas";

  const ctx = canvas.getContext("2d");

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  canvasContainer.appendChild(canvas);

  const layer = {

    id: Date.now(),

    name: name || `Layer ${layers.length + 1}`,

    canvas,
    ctx,

    locked:false,
    opacity:1
  };

  layers.push(layer);

  activeLayer = layer;

  attachDrawing(layer);

  renderLayers();
}

function renderLayers(){

  layersList.innerHTML = "";

  [...layers].reverse().forEach(layer => {

    const div = document.createElement("div");

    div.className = "layer-item";

    if(layer === activeLayer){
      div.classList.add("active");
    }

    div.innerHTML = `
      <div class="layer-top">

        <span>${layer.name}</span>

        <div class="layer-controls">

          <button onclick="toggleLock(${layer.id})">

            <i class="fas ${
              layer.locked
                ? "fa-lock"
                : "fa-lock-open"
            }"></i>

          </button>

        </div>

      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value="${layer.opacity}"
        class="opacity-slider"
        onchange="changeOpacity(${layer.id}, this.value)"
      >
    `;

    div.onclick = () => {

      activeLayer = layer;
      renderLayers();
    };

    layersList.appendChild(div);
  });
}

function toggleLock(id){

  const layer = layers.find(l => l.id === id);

  layer.locked = !layer.locked;

  renderLayers();
}

function changeOpacity(id, value){

  const layer = layers.find(l => l.id === id);

  layer.opacity = value;

  layer.canvas.style.opacity = value;
}

// ================= DRAW =================
function attachDrawing(layer){

  const canvas = layer.canvas;
  const ctx = layer.ctx;

  function getPos(e){

    const rect = canvas.getBoundingClientRect();

    return {

      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };
  }

  canvas.addEventListener("pointerdown", (e) => {

    if(layer !== activeLayer) return;
    if(layer.locked) return;

    drawing = true;

    const pos = getPos(e);

    ctx.beginPath();

    ctx.moveTo(pos.x, pos.y);

    setBrushStyle(ctx);
  });

  canvas.addEventListener("pointermove", (e) => {

    if(!drawing) return;
    if(layer !== activeLayer) return;

    const pos = getPos(e);

    ctx.lineTo(pos.x, pos.y);

    ctx.stroke();
  });

  canvas.addEventListener("pointerup", () => {

    drawing = false;
  });

  canvas.addEventListener("pointerleave", () => {

    drawing = false;
  });
}

function setBrushStyle(ctx){

  ctx.lineWidth = parseInt(brushSize.value);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if(mode === "pen"){

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = colorPicker.value;

  }else{

    ctx.globalCompositeOperation = "destination-out";
  }
}

// ================= IMAGE =================
function openImageUpload(){

  document.getElementById("imageUpload").click();
}

document
.getElementById("imageUpload")
.addEventListener("change", function(e){

  const file = e.target.files[0];

  if(!file) return;

  const img = new Image();

  img.src = URL.createObjectURL(file);

  img.onload = () => {

    addLayer("Image Layer");

    const scale = Math.min(
      canvasWidth / img.width,
      canvasHeight / img.height,
      1
    );

    const width = img.width * scale;
    const height = img.height * scale;

    activeLayer.ctx.drawImage(
      img,
      50,
      50,
      width,
      height
    );
  };
});

// ================= CLEAR =================
function clearCanvas(){

  if(!activeLayer) return;

  activeLayer.ctx.clearRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );
}

// INIT
resizeCanvas();
addLayer();
setPen();
