// Drawing operations
import { GRID_WIDTH, GRID_HEIGHT, BLOCK_SIZE } from './config.js';
import { state } from './state.js';
import { canvasElements } from './canvas.js';
import { saveToLocalStorage } from './storage.js';
import { getActiveLayer } from './layers.js';

// Start the redraw loop
export function startRedrawLoop() {
    function loop() {
        if (state.needsRedraw) {
            redrawCanvas();
            state.needsRedraw = false;
        }
        state.animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

export function getGridCoords(e) {
    const { drawingCanvas } = canvasElements;
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;

    const x = Math.floor(((e.clientX - rect.left) * scaleX) / BLOCK_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / BLOCK_SIZE);

    return { x, y };
}

export function drawBlock(x, y, texture = state.currentTexture, texturePath = state.currentTexturePath, forceDelete = false) {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    // Check if the block already has the same texture to avoid unnecessary changes
    const existingTexture = activeLayer.gridData[y][x];
    let hasChanged = false;

    if (state.isErasing || !texture || forceDelete) {
        // Only erase if there's something to erase
        if (existingTexture !== null) {
            activeLayer.gridData[y][x] = null;
            hasChanged = true;
        }
    } else {
        // If we're in delete mode for this stroke, always delete
        if (state.isDeletingInStroke) {
            if (existingTexture !== null) {
                activeLayer.gridData[y][x] = null;
                hasChanged = true;
            }
        } else {
            // Only draw if the texture is different
            if (existingTexture !== texturePath) {
                activeLayer.gridData[y][x] = texturePath;
                hasChanged = true;
            }
        }
    }

    // Mark that we need to redraw, but don't redraw yet
    if (hasChanged) {
        state.needsRedraw = true;
    }
}

export function saveState() {
    // Save all layers state for undo
    state.undoStack.push(JSON.parse(JSON.stringify(state.layers)));
    if (state.undoStack.length > 50) {
        state.undoStack.shift();
    }
    state.redoStack = [];
}

export function undo() {
    if (state.undoStack.length === 0) return;

    state.redoStack.push(JSON.parse(JSON.stringify(state.layers)));
    state.layers = state.undoStack.pop();
    redrawCanvas();
    saveToLocalStorage();
}

export function redo() {
    if (state.redoStack.length === 0) return;

    state.undoStack.push(JSON.parse(JSON.stringify(state.layers)));
    state.layers = state.redoStack.pop();
    redrawCanvas();
    saveToLocalStorage();
}

export function redrawCanvas() {
    const { drawingCtx, drawingCanvas } = canvasElements;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    let hasUnloadedImages = false;

    // Draw all visible layers in order
    for (const layer of state.layers) {
        if (!layer.visible) continue;

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const texturePath = layer.gridData[y][x];
                if (texturePath) {
                    // Use global texture cache
                    if (!state.textureCache[texturePath]) {
                        const img = new Image();
                        img.src = texturePath;
                        img.onload = () => {
                            // Redraw when image loads
                            state.needsRedraw = true;
                        };
                        state.textureCache[texturePath] = img;
                        hasUnloadedImages = true;
                    }

                    const img = state.textureCache[texturePath];
                    // Only draw if image is loaded
                    if (img.complete && img.naturalWidth > 0) {
                        drawingCtx.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    } else {
                        hasUnloadedImages = true;
                    }
                }
            }
        }
    }
}

export function clearCanvas() {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    if (confirm('Êtes-vous sûr de vouloir effacer le calque actif ?')) {
        saveState();
        activeLayer.gridData = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        state.needsRedraw = true;
        saveToLocalStorage();
    }
}

export function fillCanvas() {
    if (!state.currentTexture) {
        alert('Veuillez d\'abord sélectionner une texture');
        return;
    }

    if (confirm('Remplir le calque actif avec la texture sélectionnée ?')) {
        saveState();
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                drawBlock(x, y);
            }
        }
        saveToLocalStorage();
    }
}

export function showPreview(x, y) {
    const { previewCtx, previewCanvas } = canvasElements;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
    if (!state.currentTexture || state.isErasing) return;

    // Draw preview with transparency
    previewCtx.drawImage(state.currentTexture, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

export function clearPreview() {
    const { previewCtx, previewCanvas } = canvasElements;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}
