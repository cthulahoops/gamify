import {
  fetchPondiverseCreation,
  getPondiverseCreationImageUrl,
  addPondiverseButton,
} from "https://www.pondiverse.com/pondiverse.js";

const GRID_SIZE = 60;
const SQUARE_SIZE = 10;

const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID_SIZE * SQUARE_SIZE;
canvas.height = GRID_SIZE * SQUARE_SIZE;
const colorStates = new Map();

let grid = [];
let player = { x: 0, y: 0 };

function getMostCommonColor(data, x0, y0, size, width) {
  const colorCount = {};
  for (let y = y0; y < y0 + size; y++) {
    for (let x = x0; x < x0 + size; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      const key = `${r},${g},${b}`;
      colorCount[key] = (colorCount[key] || 0) + 1;
    }
  }
  let max = 0,
    maxColor = "255,255,255";
  for (const key in colorCount) {
    if (colorCount[key] > max) {
      max = colorCount[key];
      maxColor = key;
    }
  }
  return maxColor.split(",").map(Number);
}

function isLight([r, g, b]) {
  return (r + g + b) / 3 > 200;
}

function extractGrid(img) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(img, 0, 0, img.width, img.height);
  const imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;

  const cellW = Math.floor(img.width / GRID_SIZE);
  const cellH = Math.floor(img.height / GRID_SIZE);

  const result = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const color = getMostCommonColor(
        imageData,
        x * cellW,
        y * cellH,
        Math.min(cellW, cellH),
        img.width,
      );
      row.push(color);
    }
    result.push(row);
  }

  return result;
}

function drawGrid() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const color = grid[y][x];
      ctx.fillStyle = `rgb(${color.join(",")})`;
      ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.strokeRect(
        x * SQUARE_SIZE,
        y * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE,
      );
    }
  }

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(
    player.x * SQUARE_SIZE + SQUARE_SIZE / 2,
    player.y * SQUARE_SIZE + SQUARE_SIZE / 2,
    SQUARE_SIZE / 2.5,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}

function findRandomEmpty() {
  const empties = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (isEmpty(grid[y][x])) {
        empties.push({ x, y });
      }
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function isEmpty(color) {
  return !colorStates.get(color.join(","));
}

function addVector(v1, v2) {
  return { x: mod(v1.x + v2.x, GRID_SIZE), y: mod(v1.y + v2.y, GRID_SIZE) };
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getGridPos(pos) {
  return grid[pos.y][pos.x];
}

function setGridPos(pos, color) {
  grid[pos.y][pos.x] = color;
}

function movePlayer(delta) {
  const newPos = addVector(player, delta);
  if (isEmpty(getGridPos(newPos))) {
    player = newPos;
    drawGrid();
  } else if (isEmpty(getGridPos(addVector(newPos, delta)))) {
    player = newPos;
    const targetPos = addVector(newPos, delta);
    const movingColor = getGridPos(newPos);
    const targetColor = getGridPos(targetPos);

    setGridPos(newPos, targetColor);
    setGridPos(targetPos, movingColor);

    drawGrid();
  }
}

function handleKey(e) {
  switch (e.key) {
    case "ArrowUp":
      movePlayer(0, -1);
      break;
    case "ArrowDown":
      movePlayer(0, 1);
      break;
    case "ArrowLeft":
      movePlayer(-1, 0);
      break;
    case "ArrowRight":
      movePlayer(1, 0);
      break;
  }
}

function extractUniqueColors(grid) {
  const seen = new Set();
  const unique = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const color = grid[y][x];
      const key = color.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(color);
      }
    }
  }
  return unique;
}

function colorKey(color) {
  return color.join(",");
}

function setupColorControls(uniqueColors) {
  const colorControls = document.getElementById("color-controls");
  colorControls.innerHTML = "";
  uniqueColors.forEach((color) => {
    const key = colorKey(color);

    // Initialize state if not already set
    if (!colorStates.has(key)) {
      colorStates.set(key, !isLight(color)); // solid if not light
    }

    const label = document.createElement("label");
    label.style.display = "inline-flex";
    label.style.alignItems = "center";
    label.style.marginRight = "10px";
    label.style.marginBottom = "5px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = colorStates.get(key);
    checkbox.addEventListener("change", () => {
      colorStates.set(key, checkbox.checked);
      drawGrid();
    });

    const swatch = document.createElement("span");
    swatch.style.display = "inline-block";
    swatch.style.width = "20px";
    swatch.style.height = "20px";
    swatch.style.background = `rgb(${color.join(",")})`;
    swatch.style.border = "1px solid #888";
    swatch.style.margin = "0 5px";

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(document.createTextNode(key));
    colorControls.appendChild(label);
  });
}

function setImageFromUrl(url) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}

function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const creationId = urlParams.get("creation");

  if (!creationId) {
    ctx.font = "20px sans-serif";
    ctx.fillText("No creation specified in URL.", 20, 40);
    return;
  }

  fetchPondiverseCreation(creationId).then((creation) => {
    const imageUrl = getPondiverseCreationImageUrl(creation);
    setImageFromUrl(imageUrl).then((img) => {
      grid = extractGrid(img);
      const uniqueColors = extractUniqueColors(grid);
      setupColorControls(uniqueColors);
      player = findRandomEmpty();
      drawGrid();
      window.addEventListener("keydown", handleKey);
      document.getElementById("original").href =
        "https://www.pondiverse.com/tool/?creation=" + creationId;
    });
  });
}

main();
