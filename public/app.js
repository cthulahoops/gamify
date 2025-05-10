import {
  fetchPondiverseCreation,
  getPondiverseCreationImageUrl,
  addPondiverseButton,
} from "https://www.pondiverse.com/pondiverse.js";
import { Grid } from "./grid.js";

import { applyRules } from "./rules.js";

const DEFAULT_RULES = [
  { match: "#> ", become: " #>" },
  { match: "> ", become: " >" },
  { match: "># ", become: " >#" },
  { match: ">## ", become: " >##" },
];

const GRID_SIZE = 60;
const SQUARE_SIZE = 10;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID_SIZE * SQUARE_SIZE;
canvas.height = GRID_SIZE * SQUARE_SIZE;

const gameState = {
  grid: null,
  player: { x: 0, y: 0 },
  rules: DEFAULT_RULES,
  creation: null,
};

const symbolColors = {
  "#": "55,55,55",
  ">": "255,0,0",
  "?": "255,210,0",
  " ": "228,228,228",
};

function renderRulesGraphical(gameState) {
  const rules = gameState.rules;
  const palette = gameState?.grid?.palette;

  const container = document.getElementById("rules-graphical");
  if (!container) return;
  container.innerHTML = ""; // clear

  function getSymbolColor(sym) {
    return palette?.getColor(sym) || symbolColors[sym] || "127,127,127";
  }

  for (const rule of rules) {
    // left side squares (match)
    const leftSide = document.createElement("div");
    leftSide.style.display = "flex";
    leftSide.style.marginRight = "10px";
    for (const ch of rule.match) {
      const square = document.createElement("div");
      square.className = "rule-square";

      square.textContent = ch;
      square.style.backgroundColor = `rgb(${getSymbolColor(ch)})`;
      square.style.color = ch === " " ? "#333333" : "#FFFFFF";
      leftSide.appendChild(square);
    }

    // separator arrow
    const arrow = document.createElement("div");
    arrow.textContent = "→";
    arrow.style.margin = "0 10px";
    arrow.style.fontWeight = "bold";
    arrow.style.color = "#888888";

    // right side squares (become)
    const rightSide = document.createElement("div");
    rightSide.style.display = "flex";
    for (const ch of rule.become) {
      const square = document.createElement("div");
      square.className = "rule-square";
      square.textContent = ch;
      square.style.backgroundColor = getSymbolColor(ch);
      square.style.backgroundColor = `rgb(${getSymbolColor(ch)})`;
      square.style.color = ch === " " ? "#333333" : "#FFFFFF";
      leftSide.appendChild(square);
      rightSide.appendChild(square);
    }

    container.appendChild(leftSide);
    container.appendChild(arrow);
    container.appendChild(rightSide);
  }
}

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
  return maxColor;
}

function extractGrid(image) {
  const grid = new Grid(GRID_SIZE);
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

  grid.setupColorStates();
  return grid;
}

function drawGrid(grid) {
  grid.forEach(({ x, y, color: colorCode }) => {
    const color = grid.palette.code_to_color.get(colorCode);
    ctx.fillStyle = `rgb(${color})`;
    ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  });

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(
    gameState.player.x * SQUARE_SIZE + SQUARE_SIZE / 2,
    gameState.player.y * SQUARE_SIZE + SQUARE_SIZE / 2,
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
  applyRules(gameState.rules, gameState.grid, gameState.player, delta);
  drawGrid(gameState.grid);
}

function handleKey(e) {
  if (document.activeElement.id === "rules") return;
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

function setupColorControls(grid) {
  const colorControls = document.getElementById("color-controls");
  colorControls.innerHTML = "";
  for (const [code, color] of grid.palette.code_to_color) {
    const key = code;

    const colorStates = grid.colorStates;

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
    swatch.style.background = `rgb(${color})`;
    swatch.style.border = "1px solid #888";
    swatch.style.margin = "0 5px";

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(document.createTextNode(key));
    colorControls.appendChild(label);
  }
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

  const rulesTextArea = document.getElementById("rules");
  rulesTextArea.value = JSON.stringify(gameState.rules, null, 2);
  rulesTextArea.addEventListener("input", () => {
    let updatedRules;
    try {
      updatedRules = JSON.parse(rulesTextArea.value);
      document.getElementById("rules-errors").innerText = "";
    } catch (error) {
      document.getElementById("rules-errors").innerText = error.message;
      return;
    }
    gameState.rules = updatedRules;
    renderRulesGraphical(gameState);
  });
  rulesTextArea.dispatchEvent(new Event("input"));

  loadCreation(creationId);

  document.getElementById("reset").addEventListener("click", resetGame);

  addPondiverseButton(() => {
    const data = {
      grid: gameState.grid.toJSON(),
      player: gameState.player,
      rules: gameState.rules,
    };

    console.log("data", data);
    const creation = {
      type: "gamified",
      data: JSON.stringify(data),
      image: canvas.toDataURL(),
    };
    return creation;
  });
}

async function resetGame() {
  if (!gameState.creation) {
    return;
  }
  if (gameState.creation.type === "gamified") {
    const data = JSON.parse(gameState.creation.data);
    gameState.grid = Grid.fromJSON(data.grid);
    gameState.player = data.player;
  } else {
    const imageUrl = getPondiverseCreationImageUrl(gameState.creation);
    const img = await setImageFromUrl(imageUrl);
    gameState.grid = extractGrid(img);
    gameState.player = findRandomEmpty(gameState.grid);
  }
  setupColorControls(gameState.grid);
  drawGrid(gameState.grid);
}

async function setupCreation(creation) {
  if (creation.type === "gamified") {
    const data = JSON.parse(creation.data);
    gameState.grid = Grid.fromJSON(data.grid);
    gameState.player = data.player;
    gameState.rules = data.rules;
    const rulesTextArea = document.getElementById("rules");
    rulesTextArea.value = JSON.stringify(gameState.rules, null, 2);
    rulesTextArea.dispatchEvent(new Event("input"));
  } else {
    const imageUrl = getPondiverseCreationImageUrl(creation);
    const img = await setImageFromUrl(imageUrl);
    gameState.grid = extractGrid(img);
    gameState.player = findRandomEmpty(gameState.grid);
  }

  setupColorControls(gameState.grid);
  drawGrid(gameState.grid);
  window.addEventListener("keydown", handleKey);
}

async function loadCreation(creationId) {
  gameState.creation = await fetchPondiverseCreation(creationId);
  setupCreation(gameState.creation);

  document.getElementById("original").href =
    "https://www.pondiverse.com/tool/?creation=" + creationId;
}

main();
