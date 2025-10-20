// Texture management
import { state } from './state.js';
import { getTextureFrenchName } from './translations.js';

export async function loadTextures() {
    const texturesGrid = document.getElementById('texturesGrid');
    texturesGrid.innerHTML = '<div class="loading">Chargement des textures...</div>';

    try {
        // Fetch the list of texture files
        const response = await fetch('get-textures.php');
        const textures = await response.json();

        state.allTextures = textures.map(path => ({
            path: path,
            name: path.split('/').pop().replace('.png', ''),
            frenchName: getTextureFrenchName(path), // Add French name for search
            category: categorizeTexture(path)
        }));

        state.filteredTextures = state.allTextures;
        renderTextures();
    } catch (error) {
        console.error('Error loading textures:', error);
        texturesGrid.innerHTML = '<div class="loading">Erreur de chargement</div>';
    }
}

function categorizeTexture(path) {
    const filename = path.toLowerCase();

    if (filename.includes('stone') || filename.includes('cobblestone') || filename.includes('andesite') ||
        filename.includes('diorite') || filename.includes('granite') || filename.includes('basalt') ||
        filename.includes('brick') && !filename.includes('clay')) {
        return 'stone';
    }
    if (filename.includes('wood') || filename.includes('oak') || filename.includes('spruce') ||
        filename.includes('birch') || filename.includes('jungle') || filename.includes('acacia') ||
        filename.includes('dark_oak') || filename.includes('crimson') || filename.includes('warped') ||
        filename.includes('plank') || filename.includes('log')) {
        return 'wood';
    }
    if (filename.includes('dirt') || filename.includes('grass') || filename.includes('podzol') ||
        filename.includes('mycelium') || filename.includes('sand') || filename.includes('gravel')) {
        return 'dirt';
    }
    if (filename.includes('glass') && !filename.includes('pane_top')) {
        return 'glass';
    }
    if (filename.includes('wool')) {
        return 'wool';
    }
    if (filename.includes('concrete') && !filename.includes('powder')) {
        return 'concrete';
    }
    if (filename.includes('terracotta') || filename.includes('glazed') || filename.includes('clay')) {
        return 'terracotta';
    }
    if (filename.includes('ore') || filename.includes('diamond') || filename.includes('emerald') ||
        filename.includes('gold') || filename.includes('iron') || filename.includes('coal') ||
        filename.includes('lapis') || filename.includes('redstone') || filename.includes('quartz')) {
        return 'ore';
    }
    if (filename.includes('leaves') || filename.includes('flower') || filename.includes('plant') ||
        filename.includes('sapling') || filename.includes('vine') || filename.includes('wheat') ||
        filename.includes('carrot') || filename.includes('potato') || filename.includes('beetroot') ||
        filename.includes('melon') || filename.includes('pumpkin') || filename.includes('cactus') ||
        filename.includes('mushroom') || filename.includes('fungus') || filename.includes('roots')) {
        return 'plant';
    }

    return 'other';
}

export function renderTextures() {
    const texturesGrid = document.getElementById('texturesGrid');
    texturesGrid.innerHTML = '';

    const texturesToShow = state.currentCategory === 'all'
        ? state.filteredTextures
        : state.filteredTextures.filter(t => t.category === state.currentCategory);

    if (texturesToShow.length === 0) {
        texturesGrid.innerHTML = '<div class="loading">Aucune texture trouvée</div>';
        return;
    }

    texturesToShow.forEach(texture => {
        const item = document.createElement('div');
        item.className = 'texture-item';
        // Get French name for tooltip
        const frenchName = getTextureFrenchName(texture.path);
        item.title = frenchName;

        const img = document.createElement('img');
        img.src = texture.path;
        img.alt = frenchName;
        img.loading = 'lazy';

        item.appendChild(img);
        item.addEventListener('click', () => selectTexture(texture.path, img.src));

        texturesGrid.appendChild(item);
    });
}

export function selectTexture(path, src) {
    state.currentTexturePath = path;

    // Remove previous selection
    document.querySelectorAll('.texture-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item (if event exists)
    if (event && event.target) {
        const item = event.target.closest('.texture-item');
        if (item) item.classList.add('selected');
    }

    // Update current texture preview
    const preview = document.getElementById('currentTexturePreview');
    preview.innerHTML = `<img src="${src}" alt="Current texture">`;

    // Update current texture name with French translation
    const frenchName = getTextureFrenchName(path);
    document.getElementById('currentTextureName').textContent = frenchName;

    // Load the texture image
    state.currentTexture = new Image();
    state.currentTexture.src = src;

    // Disable eraser mode
    state.isErasing = false;
}

export function pickBlock(x, y) {
    if (x < 0 || x >= 50 || y < 0 || y >= 30) return;

    // Check all visible layers from top to bottom to find first non-empty block
    let texturePath = null;
    for (let i = state.layers.length - 1; i >= 0; i--) {
        const layer = state.layers[i];
        if (layer.visible && layer.gridData[y][x]) {
            texturePath = layer.gridData[y][x];
            break;
        }
    }

    // If no block at this position, activate eraser
    if (!texturePath) {
        state.isErasing = true;
        return;
    }

    // Select this texture
    selectTexture(texturePath, texturePath);

    // Highlight the texture in the sidebar if visible
    document.querySelectorAll('.texture-item').forEach(item => {
        const img = item.querySelector('img');
        if (img && img.src.includes(texturePath.split('/').pop())) {
            item.classList.add('selected');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Remove accents for search
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function filterTextures(searchTerm) {
    const searchNormalized = removeAccents(searchTerm.toLowerCase());
    state.filteredTextures = state.allTextures.filter(t =>
        // Search in both English and French names, without accents
        removeAccents(t.name.toLowerCase()).includes(searchNormalized) ||
        removeAccents(t.frenchName.toLowerCase()).includes(searchNormalized)
    );
    renderTextures();
}

export function setCategory(category) {
    state.currentCategory = category;
    renderTextures();
}
