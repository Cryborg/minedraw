// Zoom functionality
import { state } from './state.js';

export function zoomIn() {
    state.zoomLevel = Math.min(state.zoomLevel + 0.1, 2);
    updateZoom();
}

export function zoomOut() {
    state.zoomLevel = Math.max(state.zoomLevel - 0.1, 0.5);
    updateZoom();
}

export function updateZoom() {
    const container = document.getElementById('canvasContainer');
    container.style.transform = `scale(${state.zoomLevel})`;
    document.getElementById('zoomLevel').textContent = `${Math.round(state.zoomLevel * 100)}%`;
}
