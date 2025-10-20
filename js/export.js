// Export functionality
import { canvasElements } from './canvas.js';
import { drawBackground } from './background.js';
import { state } from './state.js';
import { GRID_WIDTH, GRID_HEIGHT, BLOCK_SIZE } from './config.js';

export async function exportCanvas() {
    const { drawingCanvas, canvasWrapper } = canvasElements;

    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = drawingCanvas.width;
    exportCanvas.height = drawingCanvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    // Get current background type from the canvas wrapper classes
    let bgType = 'day-sun'; // Default
    if (canvasWrapper.classList.contains('bg-day')) {
        bgType = 'day';
    } else if (canvasWrapper.classList.contains('bg-night-moon')) {
        bgType = 'night-moon';
    } else if (canvasWrapper.classList.contains('bg-night-stars')) {
        bgType = 'night-stars';
    } else if (canvasWrapper.classList.contains('bg-day-sun')) {
        bgType = 'day-sun';
    }

    // Draw background
    drawBackground(exportCtx, bgType, exportCanvas.width, exportCanvas.height);

    // Draw all visible layers in order
    const textureCache = {};

    for (const layer of state.layers) {
        if (!layer.visible) continue;

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const texturePath = layer.gridData[y][x];
                if (texturePath) {
                    if (!textureCache[texturePath]) {
                        textureCache[texturePath] = new Image();
                        textureCache[texturePath].src = texturePath;
                        await new Promise(resolve => {
                            textureCache[texturePath].onload = resolve;
                        });
                    }
                    exportCtx.drawImage(textureCache[texturePath], x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    // Export
    const link = document.createElement('a');
    link.download = `minedraw-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}
