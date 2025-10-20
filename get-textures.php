<?php
header('Content-Type: application/json');

function getTextures($dir, $baseDir) {
    $textures = [];

    if (!is_dir($dir)) {
        return $textures;
    }

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($files as $file) {
        if ($file->isFile() && strtolower($file->getExtension()) === 'png') {
            $path = $file->getPathname();
            // Convert to relative path from the base directory
            $relativePath = str_replace('\\', '/', str_replace($baseDir . '/', '', $path));
            $textures[] = $relativePath;
        }
    }

    // Sort alphabetically
    sort($textures);

    return $textures;
}

$baseDir = __DIR__;
$texturesDir = $baseDir . '/textures/block';
$textures = getTextures($texturesDir, $baseDir);

echo json_encode($textures);
