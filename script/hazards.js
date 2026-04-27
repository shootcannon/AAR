import { TILE_SIZE } from './constants.js';

export class Hazard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.elapsed = 0;
    }
    update(dt) { this.elapsed += dt; }
    draw(ctx, time) {}
    occupies(tx, ty) { return tx === this.x && ty === this.y; }
    isActiveAt(tx, ty, time) { return this.occupies(tx, ty) && this.isOn(time); }
    isOn(time) { return false; }
    timeUntilSafe(time, lookahead) { return 0; }
    timeUntilDanger(time, lookahead) { return Infinity; }
}

// FIRE JET: cycles ON for 1.0s then OFF for 1.4s
export class FireHazard extends Hazard {
    constructor(x, y, offset = 0) {
        super(x, y);
        this.offset = offset;
        this.period = 2400;
        this.onDuration = 1000;
    }
    isOn(time) {
        return ((time + this.offset) % this.period) < this.onDuration;
    }
    nextOnAt(time) {
        const phase = (time + this.offset) % this.period;
        if (phase < this.onDuration) return time;
        return time + (this.period - phase);
    }
    nextOffAt(time) {
        const phase = (time + this.offset) % this.period;
        if (phase < this.onDuration) return time + (this.onDuration - phase);
        return time;
    }
    draw(ctx, time) {
        const px = this.x * TILE_SIZE, py = this.y * TILE_SIZE;
        // Vent base
        ctx.fillStyle = '#1a1108';
        ctx.fillRect(px + 8, py + TILE_SIZE - 12, TILE_SIZE - 16, 10);
        ctx.fillStyle = '#3e2723';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(px + 10 + i * 9, py + TILE_SIZE - 10, 6, 6);
        }
        if (this.isOn(time)) {
            // Flames
            const phase = (time + this.offset) % this.period;
            const intensity = Math.min(1, phase / 200);
            const cy = py + TILE_SIZE - 14;
            const cx = px + TILE_SIZE / 2;
            for (let i = 0; i < 6; i++) {
                const wob = Math.sin((time + i * 80) / 60) * 4;
                const h = (TILE_SIZE - 18) * intensity * (0.6 + Math.random() * 0.4);
                const w = 18 - i * 2;
                const yOff = i * 4;
                ctx.fillStyle = i < 2 ? '#ffeb3b' : i < 4 ? '#ff9800' : '#e53935';
                ctx.globalAlpha = 0.55 + Math.random() * 0.35;
                ctx.beginPath();
                ctx.ellipse(cx + wob, cy - h / 2 - yOff, w / 2, h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            // Heat glow
            const grad = ctx.createRadialGradient(cx, cy - 16, 4, cx, cy - 16, 36);
            grad.addColorStop(0, 'rgba(255, 200, 80, 0.5)');
            grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(px - 10, py - 10, TILE_SIZE + 20, TILE_SIZE + 20);
        } else {
            // Embers
            ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.sin(time / 200) * 0.2})`;
            ctx.beginPath(); ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE - 12, 3, 0, Math.PI * 2); ctx.fill();
        }
    }
}

// ARROW TRAP: shoots arrow across a row periodically. The deadly tile is the row from shooter for `range` tiles.
export class ArrowHazard extends Hazard {
    constructor(x, y, dir, range, offset = 0) {
        super(x, y);
        this.dir = dir; // 'right'|'left'
        this.range = range;
        this.offset = offset;
        this.period = 2200;
        this.flightTime = 600;
        this.tilesPerMs = range / this.flightTime;
    }
    arrowPos(time) {
        const phase = (time + this.offset) % this.period;
        if (phase >= this.flightTime) return null;
        const dx = (phase * this.tilesPerMs) * (this.dir === 'right' ? 1 : -1);
        return { px: (this.x + 0.5) * TILE_SIZE + dx * TILE_SIZE, py: (this.y + 0.5) * TILE_SIZE };
    }
    occupies(tx, ty) {
        if (ty !== this.y) return false;
        if (this.dir === 'right') return tx > this.x && tx <= this.x + this.range;
        return tx < this.x && tx >= this.x - this.range;
    }
    isActiveAt(tx, ty, time) {
        if (ty !== this.y) return false;
        const phase = (time + this.offset) % this.period;
        if (phase >= this.flightTime) return false;
        const traveled = phase * this.tilesPerMs;
        const arrowTile = this.dir === 'right' ? this.x + traveled : this.x - traveled;
        return Math.abs(arrowTile - tx) < 0.7;
    }
    nextSafePassAt(tx, ty, time, dwellMs = 200) {
        if (ty !== this.y) return time;
        const tileOffset = this.dir === 'right' ? (tx - this.x) : (this.x - tx);
        if (tileOffset <= 0 || tileOffset > this.range) return time;
        const arrowReachesTile = tileOffset / this.tilesPerMs;
        const phase = (time + this.offset) % this.period;
        const dangerStart = (this.period - phase + arrowReachesTile - dwellMs) % this.period;
        if (dangerStart > 2 * dwellMs) return time;
        return time + (this.period - phase) + arrowReachesTile + dwellMs;
    }
    update(dt) { super.update(dt); }
    draw(ctx, time) {
        const px = this.x * TILE_SIZE, py = this.y * TILE_SIZE;
        // Shooter (skull face on wall)
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(px + 8, py + 12, TILE_SIZE - 16, TILE_SIZE - 24);
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(px + 14, py + 18, TILE_SIZE - 28, TILE_SIZE - 36);
        // Hole
        ctx.fillStyle = '#000';
        const hx = this.dir === 'right' ? px + TILE_SIZE - 14 : px + 6;
        ctx.fillRect(hx, py + TILE_SIZE / 2 - 3, 8, 6);
        // Eyes
        ctx.fillStyle = '#ff5252';
        ctx.beginPath(); ctx.arc(px + TILE_SIZE / 2 - 6, py + 24, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + TILE_SIZE / 2 + 6, py + 24, 2, 0, Math.PI * 2); ctx.fill();
        // Arrow in flight
        const a = this.arrowPos(time);
        if (a) {
            ctx.save();
            ctx.translate(a.px, a.py);
            if (this.dir === 'left') ctx.scale(-1, 1);
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-18, -1.5, 24, 3);
            ctx.fillStyle = '#bdc3c7';
            ctx.beginPath();
            ctx.moveTo(6, 0); ctx.lineTo(14, -4); ctx.lineTo(14, 4);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(-18, -3); ctx.lineTo(-22, 0); ctx.lineTo(-18, 3);
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    }
}

// SPIKES: pop up periodically
export class SpikeHazard extends Hazard {
    constructor(x, y, offset = 0) {
        super(x, y);
        this.offset = offset;
        this.period = 1800;
        this.onDuration = 700;
    }
    isOn(time) {
        return ((time + this.offset) % this.period) < this.onDuration;
    }
    nextOffAt(time) {
        const phase = (time + this.offset) % this.period;
        if (phase < this.onDuration) return time + (this.onDuration - phase);
        return time;
    }
    draw(ctx, time) {
        const px = this.x * TILE_SIZE, py = this.y * TILE_SIZE;
        // Floor plate
        ctx.fillStyle = '#1a1a1f';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = '#0a0a0d';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(px + 8 + i * 14, py + 8 + j * 14, 4, 4);
            }
        }
        const phase = (time + this.offset) % this.period;
        let popOut = 0;
        if (phase < this.onDuration) popOut = Math.min(1, phase / 150) * (1 - Math.max(0, phase - this.onDuration + 150) / 150);
        else popOut = Math.max(0, 1 - (phase - this.onDuration) / 200);
        if (popOut > 0.05) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const sx = px + 10 + i * 14;
                    const sy = py + 12 + j * 14;
                    const h = 14 * popOut;
                    ctx.fillStyle = '#7f8c8d';
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(sx + 4, sy);
                    ctx.lineTo(sx + 2, sy - h);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ecf0f1';
                    ctx.beginPath();
                    ctx.moveTo(sx + 1, sy);
                    ctx.lineTo(sx + 2, sy);
                    ctx.lineTo(sx + 2, sy - h * 0.8);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
        if (this.isOn(time)) {
            // Blood tip
            ctx.fillStyle = 'rgba(139, 0, 0, 0.4)';
            ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, 4);
        }
    }
}

// SAW: spinning saw moving back and forth across tiles
export class SawHazard extends Hazard {
    constructor(x1, y, x2, offset = 0) {
        super(x1, y);
        this.x1 = x1;
        this.x2 = x2;
        this.offset = offset;
        this.period = 3200;
    }
    sawTileX(time) {
        const phase = ((time + this.offset) % this.period) / this.period;
        const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        return this.x1 + (this.x2 - this.x1) * tri;
    }
    occupies(tx, ty) {
        if (ty !== this.y) return false;
        const lo = Math.min(this.x1, this.x2);
        const hi = Math.max(this.x1, this.x2);
        return tx >= lo && tx <= hi;
    }
    isActiveAt(tx, ty, time) {
        if (ty !== this.y) return false;
        const sx = this.sawTileX(time);
        return Math.abs(sx - tx) < 0.55;
    }
    timeWhenSawAt(targetTx, time) {
        // approximate next time saw is within danger of targetTx
        for (let dt = 0; dt < this.period; dt += 50) {
            if (this.isActiveAt(targetTx, this.y, time + dt)) return time + dt;
        }
        return time + this.period;
    }
    timeWhenSawClearOf(targetTx, time, safeDist = 1.2) {
        for (let dt = 0; dt < this.period; dt += 50) {
            const sx = this.sawTileX(time + dt);
            if (Math.abs(sx - targetTx) > safeDist) return time + dt;
        }
        return time;
    }
    draw(ctx, time) {
        // Track
        const lo = Math.min(this.x1, this.x2);
        const hi = Math.max(this.x1, this.x2);
        ctx.fillStyle = '#1a1a1f';
        ctx.fillRect(lo * TILE_SIZE, this.y * TILE_SIZE + TILE_SIZE / 2 - 4, (hi - lo + 1) * TILE_SIZE, 8);
        ctx.fillStyle = '#3a3a3a';
        for (let i = lo * TILE_SIZE; i < (hi + 1) * TILE_SIZE; i += 16) {
            ctx.fillRect(i, this.y * TILE_SIZE + TILE_SIZE / 2 - 1, 8, 2);
        }
        // Saw blade
        const sx = (this.sawTileX(time) + 0.5) * TILE_SIZE;
        const sy = (this.y + 0.5) * TILE_SIZE;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(time / 60);
        const r = 22;
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const rr = i % 2 === 0 ? r : r - 6;
            const px2 = Math.cos(a) * rr;
            const py2 = Math.sin(a) * rr;
            if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Spark trail
        if (Math.random() < 0.5) {
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(sx - 8 + Math.random() * 16, sy - 18 - Math.random() * 6, 2, 2);
        }
    }
}

// POISON GAS: cloud, alternates dense/sparse
export class PoisonHazard extends Hazard {
    constructor(x, y, offset = 0) {
        super(x, y);
        this.offset = offset;
        this.period = 3200;
        this.onDuration = 1900;
    }
    isOn(time) {
        return ((time + this.offset) % this.period) < this.onDuration;
    }
    nextOffAt(time) {
        const phase = (time + this.offset) % this.period;
        if (phase < this.onDuration) return time + (this.onDuration - phase);
        return time;
    }
    draw(ctx, time) {
        const px = this.x * TILE_SIZE, py = this.y * TILE_SIZE;
        // Vent
        ctx.fillStyle = '#0d1f0d';
        ctx.fillRect(px + 12, py + TILE_SIZE - 10, TILE_SIZE - 24, 6);
        ctx.fillStyle = '#1b3a1b';
        for (let i = 0; i < 3; i++) ctx.fillRect(px + 16 + i * 10, py + TILE_SIZE - 8, 6, 4);
        // Gas
        const phase = (time + this.offset) % this.period;
        const dense = phase < this.onDuration;
        const intensity = dense ? 1 : Math.max(0, 1 - (phase - this.onDuration) / 600);
        for (let i = 0; i < 5; i++) {
            const wob = Math.sin((time + i * 200) / 400) * 8;
            const cx = px + TILE_SIZE / 2 + wob;
            const cy = py + TILE_SIZE - 28 + Math.sin((time + i * 300) / 500) * 6 - i * 6;
            ctx.fillStyle = `rgba(120, 200, 80, ${0.18 * intensity})`;
            ctx.beginPath(); ctx.arc(cx, cy, 18 + i * 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(80, 160, 60, ${0.25 * intensity})`;
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
        }
    }
}

export function makeHazardFromSpec(spec) {
    switch (spec.type) {
        case 'fire': return new FireHazard(spec.x, spec.y, spec.offset || 0);
        case 'arrow': return new ArrowHazard(spec.x, spec.y, spec.dir, spec.range, spec.offset || 0);
        case 'spike': return new SpikeHazard(spec.x, spec.y, spec.offset || 0);
        case 'saw': return new SawHazard(spec.x1, spec.y, spec.x2, spec.offset || 0);
        case 'poison': return new PoisonHazard(spec.x, spec.y, spec.offset || 0);
    }
    return null;
}
