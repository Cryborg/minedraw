// Layers management
import { GRID_WIDTH, GRID_HEIGHT } from './config.js';
import { state } from './state.js';
import { redrawCanvas } from './drawing.js';
import { saveToLocalStorage } from './storage.js';

// Initialize layers system
export function initLayers() {
    // Create default layers if not exist
    if (!state.layers || state.layers.length === 0) {
        state.layers = [
            {
                id: 1,
                name: 'Arrière-plan',
                visible: true,
                gridData: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
            },
            {
                id: 2,
                name: 'Principal',
                visible: true,
                gridData: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
            },
            {
                id: 3,
                name: 'Détails',
                visible: true,
                gridData: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
            }
        ];
        state.activeLayerId = 2; // Start with "Principal" layer
    }
}

// Render layers UI in dropdown menu
export function renderLayersUI() {
    const layersContainer = document.getElementById('layersDropdownMenu');
    if (!layersContainer) return;

    layersContainer.innerHTML = '';

    // Render layers in reverse order (top to bottom)
    const reversedLayers = [...state.layers].reverse();

    reversedLayers.forEach((layer, index) => {
        const layerElement = document.createElement('button');
        layerElement.className = `dropdown-item layer-menu-item ${layer.id === state.activeLayerId ? 'active' : ''}`;
        layerElement.dataset.layerId = layer.id;

        layerElement.innerHTML = `
            <span class="layer-visibility-icon" data-layer-id="${layer.id}" title="${layer.visible ? 'Masquer' : 'Afficher'}">
                ${layer.visible ? '👁️' : '👁️‍🗨️'}
            </span>
            <span class="layer-menu-name">${layer.name}</span>
            <span class="layer-menu-controls">
                <button class="layer-move-btn layer-move-up" data-layer-id="${layer.id}" title="Monter" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="layer-move-btn layer-move-down" data-layer-id="${layer.id}" title="Descendre" ${index === reversedLayers.length - 1 ? 'disabled' : ''}>↓</button>
            </span>
        `;

        layersContainer.appendChild(layerElement);
    });

    // Attach events after rendering (only once)
    attachLayerEvents();
}

// Attach event listeners to layer controls
let layerEventsAttached = false;
function attachLayerEvents() {
    if (layerEventsAttached) return;

    const layersContainer = document.getElementById('layersDropdownMenu');
    if (!layersContainer) return;

    // Delegate events
    layersContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent menu from closing

        const target = e.target;

        // Get layerId from target or parent
        let layerId = parseInt(target.dataset.layerId);
        if (!layerId && target.closest('.layer-menu-item')) {
            layerId = parseInt(target.closest('.layer-menu-item').dataset.layerId);
        }

        if (target.classList.contains('layer-visibility-icon')) {
            toggleLayerVisibility(layerId);
        } else if (target.classList.contains('layer-move-up')) {
            moveLayerUp(layerId);
        } else if (target.classList.contains('layer-move-down')) {
            moveLayerDown(layerId);
        } else if (target.classList.contains('layer-menu-item') || target.classList.contains('layer-menu-name')) {
            selectLayer(layerId);
        }
    });

    layerEventsAttached = true;
}

// Toggle layer visibility
export function toggleLayerVisibility(layerId) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
        layer.visible = !layer.visible;
        renderLayersUI();
        state.needsRedraw = true;
        saveToLocalStorage();
    }
}

// Select active layer
export function selectLayer(layerId) {
    state.activeLayerId = layerId;
    renderLayersUI();
}

// Move layer up in stack
export function moveLayerUp(layerId) {
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index < state.layers.length - 1) {
        [state.layers[index], state.layers[index + 1]] = [state.layers[index + 1], state.layers[index]];
        renderLayersUI();
        state.needsRedraw = true;
        saveToLocalStorage();
    }
}

// Move layer down in stack
export function moveLayerDown(layerId) {
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index > 0) {
        [state.layers[index], state.layers[index - 1]] = [state.layers[index - 1], state.layers[index]];
        renderLayersUI();
        state.needsRedraw = true;
        saveToLocalStorage();
    }
}

// Get active layer
export function getActiveLayer() {
    return state.layers.find(l => l.id === state.activeLayerId);
}

// Get all visible layers
export function getVisibleLayers() {
    return state.layers.filter(l => l.visible);
}
