// Background rendering for export
import { STARS_DATA } from './stars-data.js';

export function drawBackground(ctx, bgType, width, height) {
    let gradient;

    if (bgType === 'day-sun' || bgType === 'day') {
        // Day sky
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#B0D9F5');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw sun if day-sun
        if (bgType === 'day-sun') {
            const sunGradient = ctx.createLinearGradient(width - 140, 40, width - 60, 120);
            sunGradient.addColorStop(0, '#FDB813');
            sunGradient.addColorStop(0.5, '#FFDD44');
            sunGradient.addColorStop(1, '#FDB813');
            ctx.fillStyle = sunGradient;
            ctx.fillRect(width - 140, 40, 80, 80);
        }
    } else if (bgType === 'night-moon' || bgType === 'night-stars') {
        // Night sky
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a1628');
        gradient.addColorStop(1, '#1a2744');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw galaxy for night-stars
        if (bgType === 'night-stars') {
            drawGalaxy(ctx, width, height);
            drawStars(ctx, width, height);
        }

        // Draw moon if night-moon
        if (bgType === 'night-moon') {
            const moonGradient = ctx.createLinearGradient(width - 140, 40, width - 60, 120);
            moonGradient.addColorStop(0, '#E8E8E8');
            moonGradient.addColorStop(0.5, '#FFFFFF');
            moonGradient.addColorStop(1, '#E8E8E8');
            ctx.fillStyle = moonGradient;
            ctx.fillRect(width - 140, 40, 80, 80);
        }
    }
}

function drawGalaxy(ctx, width, height) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-12 * Math.PI / 180);

    // Create elliptical gradient
    const maxDim = Math.max(width, height);
    const galaxyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxDim * 1.2);
    galaxyGradient.addColorStop(0, 'rgba(220, 230, 255, 0.18)');
    galaxyGradient.addColorStop(0.15, 'rgba(180, 200, 255, 0.12)');
    galaxyGradient.addColorStop(0.3, 'rgba(140, 170, 255, 0.07)');
    galaxyGradient.addColorStop(0.5, 'rgba(100, 140, 255, 0.03)');
    galaxyGradient.addColorStop(0.7, 'transparent');

    ctx.fillStyle = galaxyGradient;
    ctx.globalAlpha = 0.75;

    // Scale to create ellipse effect and ensure full coverage
    ctx.scale(1.5, 0.5);
    ctx.fillRect(-maxDim * 1.5, -maxDim, maxDim * 3, maxDim * 2);

    ctx.restore();
}

function drawStars(ctx, width, height) {
    ctx.fillStyle = 'white';
    STARS_DATA.forEach(([x, y, size]) => {
        ctx.beginPath();
        ctx.arc(x * width, y * height, size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}
