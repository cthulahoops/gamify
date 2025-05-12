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

const symbolColors = {
  "#": "#373737",
  ">": "#FF0000",
  "?": "#FFD200",
  " ": "#E4E4E4",
};

function renderRulesGraphical(gameState) {
  const rules = gameState.rules;
  const palette = gameState?.grid?.palette;

  const container = document.getElementById("rules-graphical");
  if (!container) return;
  container.innerHTML = ""; // clear

  function getSymbolColor(sym) {
    return palette?.getColor(sym) || symbolColors[sym] || "#7F7F7F";
  }

  for (const rule of rules) {
    // left side squares (match)
    const leftSide = document.createElement("div");
    leftSide.className = "rules-side";
    for (const ch of rule.match) {
      const square = document.createElement("div");
      square.className = "rule-square";
      square.textContent = ch;
      square.style.backgroundColor = getSymbolColor(ch);
      square.style.color = ch === " " ? "#333333" : "#FFFFFF";
      leftSide.appendChild(square);
    }

    // separator arrow
    const arrow = document.createElement("div");
    arrow.textContent = "→";
    arrow.className = "rule-arrow";

    // right side squares (become)
    const rightSide = document.createElement("div");
    rightSide.className = "rules-side";
    for (const ch of rule.become) {
      const square = document.createElement("div");
      square.className = "rule-square";
      square.textContent = ch;
      square.style.backgroundColor = getSymbolColor(ch);
      square.style.color = ch === " " ? "#333333" : "#FFFFFF";
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
      const hexColor = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
      colorCount[hexColor] = (colorCount[hexColor] || 0) + 1;
    }
  }
  let max = 0,
    maxColor = "#FFFFFF";
  for (const hexColor in colorCount) {
    if (colorCount[hexColor] > max) {
      max = colorCount[hexColor];
      maxColor = hexColor;
    }
  }
  return maxColor;
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
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

function drawGrid(state) {
  const { grid, player } = state;
  grid.forEach(({ x, y, color: colorCode }) => {
    const hexColor = grid.palette.code_to_color.get(colorCode);
    ctx.fillStyle = hexColor;
    ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  });

  ctx.fillStyle = "#FF0000";
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

function movePlayer(state, delta) {
  applyRules(state.rules, state.grid, state.player, delta);
  drawGrid(state);
}

function handleKey(state, e) {
  if (document.activeElement.id === "rules") return;
  switch (e.key) {
    case "ArrowUp":
      movePlayer(state, { x: 0, y: -1 });
      e.preventDefault();
      break;
    case "ArrowDown":
      movePlayer(state, { x: 0, y: 1 });
      e.preventDefault();
      break;
    case "ArrowLeft":
      movePlayer(state, { x: -1, y: 0 });
      e.preventDefault();
      break;
    case "ArrowRight":
      movePlayer(state, { x: 1, y: 0 });
      e.preventDefault();
      break;
  }
}

function setupColorControls(state) {
  const { grid } = state;
  const colorControls = document.getElementById("color-controls");
  colorControls.innerHTML = "";
  for (const [code, color] of grid.palette.code_to_color) {
    const key = code;
    const colorStates = grid.colorStates;

    const label = document.createElement("label");
    label.className = "color-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = colorStates.get(key);
    checkbox.addEventListener("change", () => {
      colorStates.set(key, checkbox.checked);
      drawGrid(state);
    });

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.background = color;

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
  const state = {
    grid: null,
    player: { x: 0, y: 0 },
    rules: DEFAULT_RULES,
    creation: null,
  };

  const urlParams = new URLSearchParams(window.location.search);
  const creationId = urlParams.get("creation");

  if (!creationId) {
    ctx.font = "20px sans-serif";
    ctx.fillText("No creation specified in URL.", 20, 40);
    return;
  }

  const rulesTextArea = document.getElementById("rules");
  rulesTextArea.value = JSON.stringify(state.rules, null, 2);
  rulesTextArea.addEventListener("input", () => {
    let updatedRules;
    try {
      updatedRules = JSON.parse(rulesTextArea.value);
      document.getElementById("rules-errors").innerText = "";
    } catch (error) {
      document.getElementById("rules-errors").innerText = error.message;
      return;
    }
    state.rules = updatedRules;
    renderRulesGraphical(state);
  });
  rulesTextArea.dispatchEvent(new Event("input"));

  loadCreation(state, creationId);

  document
    .getElementById("reset")
    .addEventListener("click", () => resetGame(state));
  document.getElementById("color-picker").addEventListener("input", (e) => {
    const hexColor = e.target.value;
    state.grid.palette.getColorCode(hexColor);
    setupColorControls(state);
  });

  addPondiverseButton(() => {
    const data = {
      grid: state.grid.toJSON(),
      player: state.player,
      rules: state.rules,
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

async function resetGame(state) {
  if (!state.creation) {
    return;
  }
  if (state.creation.type === "gamified") {
    const data = JSON.parse(state.creation.data);
    state.grid = Grid.fromJSON(data.grid);
    state.player = data.player;
  } else {
    const imageUrl = getPondiverseCreationImageUrl(state.creation);
    const img = await setImageFromUrl(imageUrl);
    state.grid = extractGrid(img);
    state.player = findRandomEmpty(state.grid);
  }
  setupColorControls(state);
  drawGrid(state);
}

async function setupCreation(state, creation) {
  if (creation.type === "gamified") {
    const data = JSON.parse(creation.data);
    state.grid = Grid.fromJSON(data.grid);
    state.player = data.player;
    state.rules = data.rules;
    const rulesTextArea = document.getElementById("rules");
    rulesTextArea.value = JSON.stringify(state.rules, null, 2);
    rulesTextArea.dispatchEvent(new Event("input"));
  } else {
    const imageUrl = getPondiverseCreationImageUrl(creation);
    const img = await setImageFromUrl(imageUrl);
    state.grid = extractGrid(img);
    state.player = findRandomEmpty(state.grid);
  }

  setupColorControls(state);
  drawGrid(state);
  window.addEventListener("keydown", (e) => handleKey(state, e));
}

async function loadCreation(state, creationId) {
  state.creation = await fetchPondiverseCreation(creationId);
  setupCreation(state, state.creation);

  document.getElementById("original").href =
    "https://www.pondiverse.com/tool/?creation=" + creationId;
}

main();
