// Canvas management
export const canvasElements = {
    drawingCanvas: null,
    gridCanvas: null,
    previewCanvas: null,
    canvasWrapper: null,
    drawingCtx: null,
    gridCtx: null,
    previewCtx: null
};

export function initCanvasElements() {
    canvasElements.drawingCanvas = document.getElementById('drawingCanvas');
    canvasElements.gridCanvas = document.getElementById('gridCanvas');
    canvasElements.previewCanvas = document.getElementById('previewCanvas');
    canvasElements.canvasWrapper = document.getElementById('canvasWrapper');
    canvasElements.drawingCtx = canvasElements.drawingCanvas.getContext('2d');
    canvasElements.gridCtx = canvasElements.gridCanvas.getContext('2d');
    canvasElements.previewCtx = canvasElements.previewCanvas.getContext('2d');
}
