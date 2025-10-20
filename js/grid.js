// Grid management
import { GRID_WIDTH, GRID_HEIGHT, BLOCK_SIZE } from './config.js';
import { state } from './state.js';
import { canvasElements } from './canvas.js';

export function initGrid() {
    state.gridData = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
}

export function drawGrid() {
    const { gridCtx, gridCanvas } = canvasElements;
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!state.showGrid) return;

    gridCtx.strokeStyle = '#ddd';
    gridCtx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= GRID_WIDTH; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x * BLOCK_SIZE, 0);
        gridCtx.lineTo(x * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
        gridCtx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y * BLOCK_SIZE);
        gridCtx.lineTo(GRID_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
        gridCtx.stroke();
    }
}

export function toggleGrid() {
    state.showGrid = !state.showGrid;
    drawGrid();

    // Save grid preference to localStorage
    localStorage.setItem('minedraw_showGrid', state.showGrid);
}
