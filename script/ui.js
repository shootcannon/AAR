import { COLORS } from './constants.js';

export function renderHUD(ctx, player, canvasWidth, canvasHeight, messageLog) {
    ctx.font = '20px "VT323", monospace';
    const padding = 20;

    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(padding, padding, 280, 100, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText(`Level: ${player.level}   Gold: ${player.gold}`, padding + 15, padding + 25);

    ctx.fillText(`HP:`, padding + 15, padding + 55);
    ctx.fillStyle = COLORS.HP_EMPTY; ctx.fillRect(padding + 50, padding + 42, 200, 14);
    ctx.fillStyle = COLORS.HP_FULL; ctx.fillRect(padding + 50, padding + 42, 200 * (Math.max(0, player.hp) / player.maxHp), 14);
    
    ctx.fillStyle = COLORS.UI_TEXT; ctx.fillText(`XP:`, padding + 15, padding + 80);
    ctx.fillStyle = COLORS.XP_EMPTY; ctx.fillRect(padding + 50, padding + 67, 200, 10);
    ctx.fillStyle = COLORS.XP_FULL; ctx.fillRect(padding + 50, padding + 67, 200 * (player.xp / player.xpToNextLevel), 10);

    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(padding, padding + 115, 280, 40, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.POTION; 
    ctx.fillText(`Potions [Tekan H]: ${player.inventory.length}`, padding + 15, padding + 142);

    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(padding, canvasHeight - 60, 340, 40, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.fillText(`[W,A,S,D]: Gerak  |  [SPASI]: Serang`, padding + 15, canvasHeight - 34);

    const logCount = 5;
    const logHeight = logCount * 24 + 20;
    const logY = canvasHeight - logHeight - padding;
    const logWidth = 350;
    
    ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
    ctx.beginPath(); ctx.roundRect(canvasWidth - logWidth - padding, logY, logWidth, logHeight, 8); ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = '#e0e0e0';
    const startX = canvasWidth - logWidth - padding + 15;
    messageLog.slice(-logCount).forEach((msg, i) => {
        ctx.fillText(`> ${msg}`, startX, logY + 28 + (i * 24));
    });
}

export function renderStory(ctx, canvasWidth, canvasHeight, text, time) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, 100);
    ctx.fillRect(0, canvasHeight - 200, canvasWidth, 200);

    ctx.fillStyle = 'rgba(15, 15, 20, 0.9)';
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(80, canvasHeight - 170, canvasWidth - 160, 130, 8); ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(140, canvasHeight - 105);
    ctx.scale(3.5, 3.5);
    ctx.fillStyle = '#f5cba7'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, -3, 10.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(5, 0, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6e2c00'; ctx.fillRect(2, -4, 6, 1.5);
    ctx.restore();

    ctx.font = 'bold 28px "VT323", monospace';
    ctx.fillStyle = '#f1c40f'; ctx.fillText("Arthur (Ksatria Terakhir Valoria)", 240, canvasHeight - 125);
    
    ctx.font = '26px "VT323", monospace';
    ctx.fillStyle = '#fff'; ctx.fillText(text, 240, canvasHeight - 85);

    if (Math.floor(time / 500) % 2 === 0) {
        ctx.fillStyle = '#aaa'; ctx.fillText("▼ Tekan [SPASI] ▼", canvasWidth - 250, canvasHeight - 60);
    }
}

export function renderGameOver(ctx, canvasWidth, canvasHeight, alpha) {
    ctx.fillStyle = `rgba(10, 5, 5, ${alpha * 0.85})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(canvasWidth/2, canvasHeight/2);
    ctx.scale(Math.min(1, alpha * 2), Math.min(1, alpha * 2));

    ctx.fillStyle = '#1a0505';
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-200, -100, 400, 200, 10); ctx.fill(); ctx.stroke();

    ctx.font = 'bold 40px "VT323", monospace';
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.fillText("ANDA TELAH GUGUR", 0, -30);

    ctx.font = '24px "VT323", monospace';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText("Kerajaan Valoria jatuh ke dalam kegelapan...", 0, 10);

    ctx.fillStyle = '#f1c40f';
    if (Math.floor(Date.now() / 500) % 2 === 0) ctx.fillText("▼ Tekan [R] untuk Bangkit Kembali ▼", 0, 65);

    ctx.restore();
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

export class ParticleSystem {
    constructor() { this.particles = []; }
    
    addText(text, x, y, color) {
        this.particles.push({ text, x, y, color, life: 1.0, dy: -1 });
    }
    
    updateAndDraw(ctx, dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
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