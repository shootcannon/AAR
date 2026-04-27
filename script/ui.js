import { COLORS, SKILLS } from './constants.js';
import { TILE_KEY, TILE_GATE, TILE_EXIT, TILE_WALL, TILE_FIRE, TILE_ARROW_TRAP } from './map.js';

export function renderHUD(ctx, player, map, canvasWidth, canvasHeight, messageLog, statusText) {
    ctx.font = '20px "VT323", monospace';
    const padding = 20;

    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(padding, padding, 300, 60, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText(`Status: ${statusText}`, padding + 15, padding + 25);
    ctx.fillStyle = map.keyTaken ? '#2ecc71' : '#7f8c8d';
    ctx.fillText(`Kunci: ${map.keyTaken ? 'DIMILIKI' : 'BELUM'}`, padding + 15, padding + 50);
    ctx.fillStyle = map.gateOpen ? '#2ecc71' : '#e67e22';
    ctx.fillText(`Gerbang: ${map.gateOpen ? 'TERBUKA' : 'TERKUNCI'}`, padding + 150, padding + 50);

    const logCount = 4;
    const logHeight = logCount * 22 + 16;
    const logY = canvasHeight - logHeight - padding;
    const logWidth = 360;
    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(canvasWidth - logWidth - padding, logY, logWidth, logHeight, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0e0e0';
    const startX = canvasWidth - logWidth - padding + 15;
    messageLog.slice(-logCount).forEach((msg, i) => {
        ctx.fillText(`> ${msg}`, startX, logY + 26 + (i * 22));
    });
}

export function renderMinimap(ctx, map, player, canvasWidth, canvasHeight) {
    const cell = 6;
    const w = map.width * cell;
    const h = map.height * cell;
    const padding = 20;
    const x0 = padding;
    const y0 = canvasHeight - h - padding;

    ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
    ctx.beginPath(); ctx.roundRect(x0 - 6, y0 - 22, w + 12, h + 28, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px "VT323", monospace';
    ctx.fillText('PETA', x0, y0 - 6);

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const t = map.data[y][x];
            const px = x0 + x * cell;
            const py = y0 + y * cell;
            if (t === TILE_WALL) {
                ctx.fillStyle = '#3a3f47';
                ctx.fillRect(px, py, cell, cell);
            } else {
                ctx.fillStyle = '#1a1a1f';
                ctx.fillRect(px, py, cell, cell);
                if (t === TILE_KEY && !map.keyTaken) {
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
                } else if (t === TILE_GATE && !map.gateOpen) {
                    ctx.fillStyle = '#e67e22';
                    ctx.fillRect(px, py, cell, cell);
                } else if (t === TILE_EXIT) {
                    ctx.fillStyle = '#2ecc71';
                    ctx.fillRect(px, py, cell, cell);
                } else if (t === TILE_FIRE) {
                    ctx.fillStyle = '#e74c3c'; // Red for fire
                    ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
                } else if (t === TILE_ARROW_TRAP) {
                    ctx.fillStyle = '#34495e'; // Dark blue/grey for trap
                    ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
                }
            }
        }
    }

    const ppx = x0 + player.tileX * cell + cell / 2;
    const ppy = y0 + player.tileY * cell + cell / 2;
    ctx.fillStyle = '#3498db';
    ctx.beginPath(); ctx.arc(ppx, ppy, cell * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
}

export function renderStory(ctx, canvasWidth, canvasHeight, text, time) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, 100);
    ctx.fillRect(0, canvasHeight - 200, canvasWidth, 200);

    ctx.fillStyle = 'rgba(15, 15, 20, 0.9)';
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(80, canvasHeight - 170, canvasWidth - 160, 130, 8); ctx.fill(); ctx.stroke();

    ctx.font = 'bold 28px "VT323", monospace';
    ctx.fillStyle = '#f1c40f'; ctx.fillText("Arthur — Penjelajah Labirin", 120, canvasHeight - 125);

    ctx.font = '26px "VT323", monospace';
    ctx.fillStyle = '#fff'; ctx.fillText(text, 120, canvasHeight - 85);

    if (Math.floor(time / 500) % 2 === 0) {
        ctx.fillStyle = '#aaa'; ctx.fillText("▼ Tekan [SPASI] ▼", canvasWidth - 250, canvasHeight - 60);
    }
}

export function renderWin(ctx, canvasWidth, canvasHeight, alpha) {
    ctx.fillStyle = `rgba(5, 20, 10, ${alpha * 0.85})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(Math.min(1, alpha * 2), Math.min(1, alpha * 2));
    ctx.fillStyle = '#0a1f12';
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-220, -100, 440, 200, 10); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 40px "VT323", monospace';
    ctx.fillStyle = '#2ecc71';
    ctx.textAlign = 'center';
    ctx.fillText("LABIRIN DITAKLUKKAN!", 0, -30);
    ctx.font = '24px "VT323", monospace';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText("Arthur menemukan jalan keluar.", 0, 10);
    ctx.fillStyle = '#f1c40f';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText("▼ Tekan [R] untuk Labirin Baru ▼", 0, 65);
    ctx.restore();
    ctx.textAlign = 'left';
}

export function renderPauseScreen(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("PAUSED", canvasWidth / 2, canvasHeight / 2);
    ctx.font = '24px "VT323", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText("Tekan [ESC] untuk Melanjutkan", canvasWidth / 2, canvasHeight / 2 + 40);
    ctx.textAlign = 'left';
}

export function renderDeathScreen(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = 'rgba(50, 0, 0, 0.85)'; // Dark red overlay
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.fillStyle = '#1f0000'; // Darker red background for box
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4; // Red border
    ctx.beginPath(); ctx.roundRect(-220, -100, 440, 200, 10); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 40px "VT323", monospace';
    ctx.fillStyle = '#e74c3c'; // Red text
    ctx.textAlign = 'center';
    ctx.fillText("ANDA MATI!", 0, -30);
    ctx.font = '24px "VT323", monospace';
    ctx.fillStyle = '#ecf0f1'; // Light text
    ctx.fillText("Arthur tidak menemukan jalan keluar.", 0, 10);
    ctx.fillStyle = '#f1c40f'; // Yellow text for prompt
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText("▼ Tekan [R] untuk Pilih Labirin Baru ▼", 0, 65);
    ctx.restore();
    ctx.textAlign = 'left';
}

export function renderMapSelectionScreen(ctx, canvasWidth, canvasHeight, mapConfigs, currentMapIndex) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.font = 'bold 48px "VT323", monospace';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText("PILIH LABIRIN", canvasWidth / 2, canvasHeight / 2 - 150);

    mapConfigs.forEach((config, index) => {
        const isSelected = index === currentMapIndex;
        ctx.fillStyle = isSelected ? '#2ecc71' : '#ecf0f1'; // Highlight selected map
        ctx.font = isSelected ? 'bold 36px "VT323", monospace' : '32px "VT323", monospace';
        ctx.fillText(`${isSelected ? '> ' : ''}${config.name}${isSelected ? ' <' : ''}`, canvasWidth / 2, canvasHeight / 2 - 50 + (index * 50));
        ctx.font = '20px "VT323", monospace';
        ctx.fillStyle = isSelected ? '#aaffaa' : '#aaa'; // Description color
        ctx.fillText(config.description, canvasWidth / 2, canvasHeight / 2 - 25 + (index * 50));
    });

    ctx.font = '24px "VT323", monospace';
    ctx.fillStyle = '#f1c40f';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText("Tekan [SPASI] atau [ENTER] untuk Mulai", canvasWidth / 2, canvasHeight - 100);
    ctx.textAlign = 'left';
}

export function renderSkillBar(ctx, player, canvasWidth, canvasHeight) {
    const skillKeys = Object.values(SKILLS);
    const w = 60, h = 60, gap = 15;
    const totalW = (w + gap) * skillKeys.length - gap;
    let startX = (canvasWidth - totalW) / 2;
    const y = canvasHeight - 90;

    skillKeys.forEach((skill) => {
        const cd = player.cooldowns[skill.id] || 0;
        const maxCd = skill.cd;
        const ratio = cd / maxCd;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath(); ctx.roundRect(startX, y, w, h, 8); ctx.fill();
        ctx.strokeStyle = cd > 0 ? COLORS.SKILL_COOLDOWN : COLORS.SKILL_READY;
        ctx.lineWidth = 2; ctx.stroke();

        if (cd > 0) {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
            ctx.fillRect(startX, y + h * (1 - ratio), w, h * ratio);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(skill.key, startX + w / 2, y + h / 2 + 7);
        ctx.font = '12px "VT323", monospace';
        ctx.fillText(skill.id.toUpperCase(), startX + w / 2, y + h + 15);
        startX += w + gap;
    });
    ctx.textAlign = 'left';
}

export class ParticleSystem {
    constructor() { this.particles = []; }
    addText(text, x, y, color) {
        this.particles.push({ text, x, y, color, life: 1.0, dy: -1 });
    }
    updateAndDraw(ctx, dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt / 1000;
            p.y += p.dy * (dt / 16);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = p.color;
            ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
            ctx.strokeText(p.text, p.x, p.y);
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1.0;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }
}
