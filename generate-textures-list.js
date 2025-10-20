#!/usr/bin/env node

/**
 * Script to generate textures.json from the textures/block directory
 * This replaces get-textures.php for static hosting on Vercel
 */

const fs = require('fs');
const path = require('path');

function getTextures(dir, baseDir) {
    const textures = [];

    function scanDirectory(currentDir) {
        const files = fs.readdirSync(currentDir);

        files.forEach(file => {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (stat.isFile() && path.extname(file).toLowerCase() === '.png') {
                // Convert to relative path from base directory
                const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                textures.push(relativePath);
            }
        });
    }

    if (fs.existsSync(dir)) {
        scanDirectory(dir);
    }

    // Sort alphabetically
    textures.sort();

    return textures;
}

const baseDir = __dirname;
const texturesDir = path.join(baseDir, 'textures', 'block');
const textures = getTextures(texturesDir, baseDir);

// Write to textures.json
const outputPath = path.join(baseDir, 'textures.json');
fs.writeFileSync(outputPath, JSON.stringify(textures, null, 2));

console.log(`✅ Generated textures.json with ${textures.length} textures`);
