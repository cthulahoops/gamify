import {
  fetchPondiverseCreation,
  getPondiverseCreationImageUrl,
  addPondiverseButton,
} from "https://www.pondiverse.com/pondiverse.js";
import { Grid } from "./grid.js";

const GRID_SIZE = 60;
const SQUARE_SIZE = 10;

const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID_SIZE * SQUARE_SIZE;
canvas.height = GRID_SIZE * SQUARE_SIZE;

let grid;
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

function extractGrid(image) {
  grid = new Grid(GRID_SIZE);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height).data;

  const cellWidth = Math.floor(image.width / grid.gridSize);
  const cellHeight = Math.floor(image.height / grid.gridSize);

  for (let y = 0; y < grid.gridSize; y++) {
    for (let x = 0; x < grid.gridSize; x++) {
      const color = getMostCommonColor(
        imageData,
        x * cellWidth,
        y * cellHeight,
        Math.min(cellWidth, cellHeight),
        image.width,
      );
      grid.setCell({ x, y }, color);
    }
  }
  return grid;
}

function drawGrid(grid) {
  grid.forEach(({ x, y, color }) => {
    ctx.fillStyle = `rgb(${color.join(",")})`;
    ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  });

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

function findRandomEmpty(grid) {
  const emptyCells = [];

  grid.forEach(({ x, y }) => {
    if (grid.isEmpty({ x, y })) {
      emptyCells.push({ x, y });
    }
  });

  if (emptyCells.length === 0) return null; // No empty cells found

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

function movePlayer(delta) {
  const newPos = grid.addVector(player, delta);
  if (grid.isEmpty(newPos)) {
    player = newPos;
    drawGrid(grid);
  } else if (grid.isEmpty(grid.addVector(newPos, delta))) {
    player = newPos;
    const targetPos = grid.addVector(newPos, delta);
    const movingColor = grid.getCell(newPos);
    const targetColor = grid.getCell(targetPos);

    grid.setCell(newPos, targetColor);
    grid.setCell(targetPos, movingColor);

    drawGrid(grid);
  }
}

function handleKey(e) {
  switch (e.key) {
    case "ArrowUp":
      movePlayer({ x: 0, y: -1 });
      e.preventDefault();
      break;
    case "ArrowDown":
      movePlayer({ x: 0, y: 1 });
      e.preventDefault();
      break;
    case "ArrowLeft":
      movePlayer({ x: -1, y: 0 });
      e.preventDefault();
      break;
    case "ArrowRight":
      movePlayer({ x: 1, y: 0 });
      e.preventDefault();
      break;
  }
}

function extractUniqueColors(grid) {
  const seen = new Set();
  const unique = [];
  grid.forEach(({ x, y, color }) => {
    const key = color.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(color);
    }
  });
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

    const colorStates = grid.colorStates;

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
      drawGrid(grid);
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
      player = findRandomEmpty(grid);
      drawGrid(grid);
      window.addEventListener("keydown", handleKey);
      document.getElementById("original").href =
        "https://www.pondiverse.com/tool/?creation=" + creationId;
    });
  });
}

main();
