// Main entry point - MineDraw application
import { initCanvasElements } from './canvas.js';
import { initGrid, drawGrid } from './grid.js';
import { loadTextures } from './textures.js';
import { loadFromLocalStorage, loadBackgroundPreference, loadGridPreference } from './storage.js';
import { setupEventListeners } from './events.js';
import { initLayers, renderLayersUI } from './layers.js';
import { startRedrawLoop } from './drawing.js';

async function init() {
    // Initialize canvas references
    initCanvasElements();

    // Initialize grid
    initGrid();

    // Initialize layers system
    initLayers();

    // Load user preferences
    loadBackgroundPreference();
    loadGridPreference();

    // Setup all event listeners
    setupEventListeners();

    // Load textures
    await loadTextures();

    // Start the redraw loop (before loading saved data)
    startRedrawLoop();

    // Load saved drawing (will restore layers if exist and trigger redraw)
    loadFromLocalStorage();

    // Render layers UI after loading
    renderLayersUI();

    console.log('✨ MineDraw initialized successfully with layers!');
}

// Start the application
init();
