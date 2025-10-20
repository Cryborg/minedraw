// LocalStorage management
import { state } from './state.js';
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

export async function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('minedraw_layers');
        if (savedData) {
            const data = JSON.parse(savedData);
            state.layers = data.layers;
            state.activeLayerId = data.activeLayerId;
            state.needsRedraw = true; // Trigger redraw on next frame
            console.log('Dessin chargé depuis la sauvegarde automatique');
        } else {
            // First time user - load demo drawing
            await loadDemoDrawing();
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

async function loadDemoDrawing() {
    try {
        console.log('🔄 Chargement du dessin de démonstration...');
        const response = await fetch('demo-drawing.json');
        const demoData = await response.json();
        state.layers = demoData.layers;
        state.activeLayerId = demoData.activeLayerId;
        state.needsRedraw = true;
        console.log('🎨 Dessin de démonstration chargé - Bienvenue sur MineDraw!');
        console.log('Layers loaded:', state.layers.length);
        console.log('Active layer ID:', state.activeLayerId);

        // Force multiple redraws to handle async texture loading
        setTimeout(() => { state.needsRedraw = true; }, 100);
        setTimeout(() => { state.needsRedraw = true; }, 500);
        setTimeout(() => { state.needsRedraw = true; }, 1000);
    } catch (e) {
        console.error('Error loading demo drawing:', e);
    }
}

export function loadBackgroundPreference() {
    try {
        const savedBg = localStorage.getItem('minedraw_background');
        if (savedBg) {
            state.backgroundType = savedBg;
        } else {
            // Default background
            state.backgroundType = 'day-sun';
        }
    } catch (e) {
        console.error('Error loading background preference:', e);
        state.backgroundType = 'day-sun';
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
