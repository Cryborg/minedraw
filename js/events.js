// Event handlers
import { state } from './state.js';
import { canvasElements } from './canvas.js';
import { getGridCoords, drawBlock, saveState, undo, redo, clearCanvas, fillCanvas, showPreview, clearPreview } from './drawing.js';
import { pickBlock, filterTextures, setCategory } from './textures.js';
import { toggleGrid } from './grid.js';
import { exportCanvas } from './export.js';
import { zoomIn, zoomOut, updateZoom } from './zoom.js';
import { getActiveLayer, renderLayersUI } from './layers.js';
import { saveToLocalStorage } from './storage.js';

export function setupEventListeners() {
    setupMouseEvents();
    setupTouchEvents();
    setupMenuEvents();
    setupCategoryEvents();
    setupSearchEvents();
    setupKeyboardShortcuts();
}

function setupMouseEvents() {
    const { drawingCanvas } = canvasElements;

    drawingCanvas.addEventListener('mousedown', (e) => {
        const { x, y } = getGridCoords(e);

        // Right click - pick color (eyedropper)
        if (e.button === 2) {
            e.preventDefault();
            pickBlock(x, y);
            return;
        }

        // Left click - draw
        if (e.button === 0) {
            state.isDrawing = true;
            state.hasDrawnThisStroke = false;
            saveState();

            const activeLayer = getActiveLayer();
            if (activeLayer) {
                // Determine if we should delete for this entire stroke
                if (activeLayer.gridData[y] && activeLayer.gridData[y][x] === state.currentTexturePath && !state.isErasing && state.currentTexture) {
                    state.isDeletingInStroke = true;
                } else {
                    state.isDeletingInStroke = false;
                }
            }

            drawBlock(x, y);
            state.hasDrawnThisStroke = true;
        }
    });

    // Prevent context menu on right click
    drawingCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    drawingCanvas.addEventListener('mousemove', (e) => {
        const { x, y } = getGridCoords(e);

        // Draw if mouse is pressed
        if (state.isDrawing) {
            clearPreview();
            drawBlock(x, y);
        } else {
            // Show preview only when not drawing
            showPreview(x, y);
        }
    });

    drawingCanvas.addEventListener('mouseup', () => {
        state.isDrawing = false;
        state.hasDrawnThisStroke = false;
        state.isDeletingInStroke = false;
        saveToLocalStorage();
    });

    drawingCanvas.addEventListener('mouseleave', () => {
        state.isDrawing = false;
        state.hasDrawnThisStroke = false;
        state.isDeletingInStroke = false;
        clearPreview();
        saveToLocalStorage();
    });
}

function setupTouchEvents() {
    const { drawingCanvas, canvasWrapper } = canvasElements;

    drawingCanvas.addEventListener('touchstart', (e) => {
        // Two fingers - prepare for pinch or scroll
        if (e.touches.length === 2) {
            e.preventDefault();
            state.isPinching = true;
            state.isDrawing = false;

            // Calculate initial distance for pinch
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            state.lastTouchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            // Store initial scroll position
            state.lastScrollPos = {
                x: canvasWrapper.scrollLeft,
                y: canvasWrapper.scrollTop
            };
            return;
        }

        // One finger - draw
        if (e.touches.length === 1 && !state.isPinching) {
            e.preventDefault();
            state.isDrawing = true;
            state.hasDrawnThisStroke = false;
            saveState();

            const touch = e.touches[0];
            const { x, y } = getGridCoords(touch);

            const activeLayer = getActiveLayer();
            if (activeLayer) {
                // Determine if we should delete for this entire stroke
                if (activeLayer.gridData[y] && activeLayer.gridData[y][x] === state.currentTexturePath && !state.isErasing && state.currentTexture) {
                    state.isDeletingInStroke = true;
                } else {
                    state.isDeletingInStroke = false;
                }
            }

            drawBlock(x, y);
            state.hasDrawnThisStroke = true;
        }
    });

    drawingCanvas.addEventListener('touchmove', (e) => {
        // Two fingers - pinch to zoom or scroll
        if (e.touches.length === 2) {
            e.preventDefault();

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];

            // Calculate current distance for pinch
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            // Pinch to zoom
            if (state.lastTouchDistance > 0) {
                const delta = currentDistance - state.lastTouchDistance;
                const zoomFactor = delta > 0 ? 0.02 : -0.02;
                state.zoomLevel = Math.max(0.5, Math.min(2, state.zoomLevel + zoomFactor));
                updateZoom();
            }

            state.lastTouchDistance = currentDistance;

            // Two-finger scroll
            const midX = (touch1.clientX + touch2.clientX) / 2;
            const midY = (touch1.clientY + touch2.clientY) / 2;

            if (state.lastScrollPos.midX !== undefined) {
                const deltaX = state.lastScrollPos.midX - midX;
                const deltaY = state.lastScrollPos.midY - midY;
                canvasWrapper.scrollLeft += deltaX;
                canvasWrapper.scrollTop += deltaY;
            }

            state.lastScrollPos.midX = midX;
            state.lastScrollPos.midY = midY;

            return;
        }

        // One finger - draw
        if (e.touches.length === 1 && state.isDrawing && !state.isPinching) {
            e.preventDefault();
            const touch = e.touches[0];
            const { x, y } = getGridCoords(touch);
            drawBlock(x, y);
        }
    });

    drawingCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();

        // Reset pinching state when no more touches
        if (e.touches.length === 0) {
            state.isDrawing = false;
            state.isPinching = false;
            state.lastTouchDistance = 0;
            state.isDeletingInStroke = false;
            state.hasDrawnThisStroke = false;
            state.lastScrollPos.midX = undefined;
            state.lastScrollPos.midY = undefined;
            saveToLocalStorage();
        }

        // Reset pinching if only one finger left
        if (e.touches.length === 1) {
            state.isPinching = false;
            state.lastTouchDistance = 0;
            state.lastScrollPos.midX = undefined;
            state.lastScrollPos.midY = undefined;
        }
    });
}

function setupMenuEvents() {
    // Menu Affichage
    document.getElementById('menuGridBtn').addEventListener('click', () => {
        toggleGrid();
        // Update checkmark
        const icon = document.querySelector('#menuGridBtn .menu-icon');
        icon.classList.toggle('hidden');
    });

    // Background selection from menu
    document.querySelectorAll('[data-bg]').forEach(btn => {
        btn.addEventListener('click', () => {
            const bgValue = btn.dataset.bg;

            // Update state (this will be used by redrawCanvas)
            state.backgroundType = bgValue;
            state.needsRedraw = true;

            // Save preference to localStorage
            localStorage.setItem('minedraw_background', bgValue);
        });
    });

    // Menu Édition
    document.getElementById('menuUndoBtn').addEventListener('click', undo);
    document.getElementById('menuRedoBtn').addEventListener('click', redo);
    document.getElementById('menuClearBtn').addEventListener('click', clearCanvas);
    document.getElementById('menuFillBtn').addEventListener('click', fillCanvas);

    // Eraser from menu
    document.getElementById('menuEraserBtn').addEventListener('click', () => {
        state.isErasing = !state.isErasing;
        updateEraserUI();
    });

    // Menu Fichier
    document.getElementById('menuExportPngBtn').addEventListener('click', exportCanvas);
    document.getElementById('menuExportJsonBtn').addEventListener('click', exportJSON);
    document.getElementById('menuImportJsonBtn').addEventListener('click', importJSON);

    // Quick toolbar
    document.getElementById('quickEraserBtn').addEventListener('click', () => {
        state.isErasing = !state.isErasing;
        updateEraserUI();
    });
    document.getElementById('quickUndoBtn').addEventListener('click', undo);
    document.getElementById('quickRedoBtn').addEventListener('click', redo);

    // Zoom controls in header
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
}

function updateEraserUI() {
    const quickBtn = document.getElementById('quickEraserBtn');
    const menuIcon = document.querySelector('.eraser-icon');

    if (state.isErasing) {
        quickBtn.classList.add('active');
        menuIcon.classList.remove('hidden');
        menuIcon.classList.add('visible');
    } else {
        quickBtn.classList.remove('active');
        menuIcon.classList.add('hidden');
        menuIcon.classList.remove('visible');
    }
}

function setupCategoryEvents() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setCategory(btn.dataset.category);
        });
    });
}

function setupSearchEvents() {
    const searchInput = document.getElementById('searchTextures');
    const clearSearchBtn = document.getElementById('clearSearch');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        filterTextures(searchTerm);

        // Show/hide clear button
        if (searchTerm.length > 0) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
    });

    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterTextures('');
        clearSearchBtn.classList.remove('visible');
        searchInput.focus();
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
            if (e.key === 'e') {
                e.preventDefault();
                exportCanvas();
            }
        }
        if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
            state.isErasing = !state.isErasing;
            updateEraserUI();
        }
    });
}

// Export drawing to JSON file
function exportJSON() {
    try {
        const saveData = {
            layers: state.layers,
            activeLayerId: state.activeLayerId
        };

        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `minedraw-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('✅ Dessin exporté en JSON');
    } catch (e) {
        console.error('Erreur lors de l\'export JSON:', e);
        alert('Erreur lors de l\'export JSON');
    }
}

// Import drawing from JSON file
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.layers || !Array.isArray(data.layers)) {
                throw new Error('Format JSON invalide');
            }

            // Load the data
            state.layers = data.layers;
            state.activeLayerId = data.activeLayerId || 2;
            state.needsRedraw = true;

            // Save to localStorage
            saveToLocalStorage();

            // Update UI
            renderLayersUI();

            console.log('✅ Dessin importé depuis JSON');
            alert('Dessin importé avec succès !');
        } catch (e) {
            console.error('Erreur lors de l\'import JSON:', e);
            alert('Erreur lors de l\'import JSON: ' + e.message);
        }
    });

    input.click();
}
