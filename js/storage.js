// LocalStorage management
import { state } from './state.js';
import { canvasElements } from './canvas.js';
import { redrawCanvas } from './drawing.js';
import { drawGrid } from './grid.js';

export function saveToLocalStorage() {
    try {
        const saveData = {
            layers: state.layers,
            activeLayerId: state.activeLayerId
        };
        localStorage.setItem('minedraw_layers', JSON.stringify(saveData));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

export function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('minedraw_layers');
        if (savedData) {
            const data = JSON.parse(savedData);
            state.layers = data.layers;
            state.activeLayerId = data.activeLayerId;
            state.needsRedraw = true; // Trigger redraw on next frame
            console.log('Dessin chargé depuis la sauvegarde automatique');
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

export function loadBackgroundPreference() {
    try {
        const savedBg = localStorage.getItem('minedraw_background');
        if (savedBg) {
            canvasElements.canvasWrapper.classList.add('bg-' + savedBg);
        } else {
            // Default background
            canvasElements.canvasWrapper.classList.add('bg-day-sun');
        }
    } catch (e) {
        console.error('Error loading background preference:', e);
        canvasElements.canvasWrapper.classList.add('bg-day-sun');
    }
}

export function loadGridPreference() {
    try {
        const savedGridState = localStorage.getItem('minedraw_showGrid');
        if (savedGridState !== null) {
            state.showGrid = savedGridState === 'true';
            drawGrid();
        }
    } catch (e) {
        console.error('Error loading grid preference:', e);
    }
}
