// Application state
export const state = {
    currentTexture: null,
    currentTexturePath: null,
    isDrawing: false,
    isErasing: false,
    isDeletingInStroke: false,
    showGrid: true,
    layers: [], // Array of layer objects with their own gridData
    activeLayerId: null, // ID of the currently active layer
    undoStack: [],
    redoStack: [],
    allTextures: [],
    filteredTextures: [],
    currentCategory: 'all',
    zoomLevel: 1,
    lastTouchDistance: 0,
    lastScrollPos: { x: 0, y: 0 },
    isPinching: false,
    hasDrawnThisStroke: false,
    needsRedraw: false, // Flag to indicate canvas needs redrawing
    animationFrameId: null, // For requestAnimationFrame
    textureCache: {} // Global texture cache for fast redraws
};
