#!/usr/bin/env node

/**
 * Generate a demo drawing for MineDraw
 * Simple landscape with grass, dirt, and some decorations
 */

// Canvas dimensions
const GRID_WIDTH = 50;
const GRID_HEIGHT = 30;

// Create empty layers
function createEmptyLayer(id, name) {
    return {
        id: id,
        name: name,
        visible: true,
        gridData: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
    };
}

// Textures to use
const TEXTURES = {
    dirt: 'textures/block/dirt.png',
    grass_side: 'textures/block/grass_block_side.png',
    grass_top: 'textures/block/grass_block_top.png',
    stone: 'textures/block/stone.png',
    cobblestone: 'textures/block/cobblestone.png',
    oak_log: 'textures/block/oak_log.png',
    oak_leaves: 'textures/block/oak_leaves.png',
    oak_planks: 'textures/block/oak_planks.png',
    dandelion: 'textures/block/dandelion.png',
    poppy: 'textures/block/poppy.png',
    grass: 'textures/block/grass.png'
};

// Initialize layers
const layers = [
    createEmptyLayer(1, 'Arrière-plan'),
    createEmptyLayer(2, 'Principal'),
    createEmptyLayer(3, 'Détails')
];

// Layer shortcuts
const bgLayer = layers[0].gridData;      // Background
const mainLayer = layers[1].gridData;    // Main
const detailsLayer = layers[2].gridData; // Details

// Ground level (bottom 8 rows will be ground)
const groundLevel = 22; // Y coordinate where grass starts

// 1. BACKGROUND LAYER - Sky decoration (optional clouds with stone blocks)
// Add some simple "cloud" blocks in the sky
bgLayer[5][10] = TEXTURES.cobblestone;
bgLayer[5][11] = TEXTURES.cobblestone;
bgLayer[5][12] = TEXTURES.cobblestone;
bgLayer[6][9] = TEXTURES.cobblestone;
bgLayer[6][13] = TEXTURES.cobblestone;

bgLayer[8][35] = TEXTURES.cobblestone;
bgLayer[8][36] = TEXTURES.cobblestone;
bgLayer[9][34] = TEXTURES.cobblestone;
bgLayer[9][37] = TEXTURES.cobblestone;

// 2. MAIN LAYER - Ground and structures

// Fill underground with dirt (rows 23-29)
for (let y = groundLevel + 1; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
        mainLayer[y][x] = TEXTURES.dirt;
    }
}

// Add grass top layer (row 22)
for (let x = 0; x < GRID_WIDTH; x++) {
    mainLayer[groundLevel][x] = TEXTURES.grass_top;
}

// Add a small tree (oak)
const treeX = 15;
const treeY = groundLevel;

// Tree trunk (4 blocks high)
mainLayer[treeY - 1][treeX] = TEXTURES.oak_log;
mainLayer[treeY - 2][treeX] = TEXTURES.oak_log;
mainLayer[treeY - 3][treeX] = TEXTURES.oak_log;
mainLayer[treeY - 4][treeX] = TEXTURES.oak_log;

// Tree leaves (simple 5x3 blob)
for (let dy = -6; dy <= -4; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
        if (treeY + dy >= 0 && treeX + dx >= 0 && treeX + dx < GRID_WIDTH) {
            mainLayer[treeY + dy][treeX + dx] = TEXTURES.oak_leaves;
        }
    }
}

// Add a nice house structure (9 blocks wide)
const houseX = 30;
const houseY = groundLevel;

// House floor (oak planks, 7 blocks wide)
for (let x = 1; x < 8; x++) {
    mainLayer[houseY][houseX + x] = TEXTURES.oak_planks;
}

// House walls (oak planks, 4 blocks high)
for (let y = 1; y <= 4; y++) {
    // Left wall
    mainLayer[houseY - y][houseX + 1] = TEXTURES.oak_planks;
    // Right wall
    mainLayer[houseY - y][houseX + 7] = TEXTURES.oak_planks;
    // Back wall (fill interior)
    for (let x = 2; x <= 6; x++) {
        if (y === 4) {
            // Top row of walls
            mainLayer[houseY - y][houseX + x] = TEXTURES.oak_planks;
        }
    }
}

// Door opening (2 blocks high, bottom center)
mainLayer[houseY - 1][houseX + 4] = null;
mainLayer[houseY - 2][houseX + 4] = null;

// Windows (cobblestone as window frame)
mainLayer[houseY - 2][houseX + 2] = TEXTURES.cobblestone;  // Left window
mainLayer[houseY - 2][houseX + 6] = TEXTURES.cobblestone;  // Right window

// Roof (triangular, oak log)
// Bottom roof layer (9 blocks)
for (let x = 0; x < 9; x++) {
    mainLayer[houseY - 5][houseX + x] = TEXTURES.oak_log;
}
// Second roof layer (7 blocks)
for (let x = 1; x < 8; x++) {
    mainLayer[houseY - 6][houseX + x] = TEXTURES.oak_log;
}
// Third roof layer (5 blocks)
for (let x = 2; x < 7; x++) {
    mainLayer[houseY - 7][houseX + x] = TEXTURES.oak_log;
}
// Fourth roof layer (3 blocks)
for (let x = 3; x < 6; x++) {
    mainLayer[houseY - 8][houseX + x] = TEXTURES.oak_log;
}
// Top of roof (1 block)
mainLayer[houseY - 9][houseX + 4] = TEXTURES.oak_log;

// 3. DETAILS LAYER - Flowers and decorations

// Add some flowers randomly on the grass
const flowers = [
    { x: 5, texture: TEXTURES.dandelion },
    { x: 8, texture: TEXTURES.poppy },
    { x: 12, texture: TEXTURES.dandelion },
    { x: 20, texture: TEXTURES.grass },
    { x: 22, texture: TEXTURES.poppy },
    { x: 25, texture: TEXTURES.dandelion },
    { x: 40, texture: TEXTURES.grass },
    { x: 43, texture: TEXTURES.poppy },
    { x: 45, texture: TEXTURES.dandelion }
];

flowers.forEach(flower => {
    detailsLayer[groundLevel - 1][flower.x] = flower.texture;
});

// Create the save data structure
const saveData = {
    layers: layers,
    activeLayerId: 2 // Start with main layer active
};

// Output as JSON
console.log(JSON.stringify(saveData, null, 2));
