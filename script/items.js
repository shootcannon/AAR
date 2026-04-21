import { TILE_SIZE, COLORS } from './constants.js';

export class Item {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    draw(ctx, time) {}
    use(user) { return `Tidak bisa memakai ${this.name}.`; }
}

export class HealthPotion extends Item {
    constructor(x, y) {
        super(x, y, 'Health Potion');
        this.healAmount = 40;
    }
    draw(ctx, time) {
        let px = this.x * TILE_SIZE;
        let py = this.y * TILE_SIZE + Math.sin(time / 200 + this.floatOffset) * 5;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(px + TILE_SIZE/2, this.y * TILE_SIZE + TILE_SIZE/2 + 20, 10, 4, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = COLORS.POTION;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2 + 8, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(px + TILE_SIZE/2 - 4, py + TILE_SIZE/2 - 12, 8, 16);
    }
    use(user) {
        if (user.hp >= user.maxHp) return 'HP sudah penuh.';
        user.hp = Math.min(user.maxHp, user.hp + this.healAmount);
        return `Meminum Potion. HP pulih +${this.healAmount}.`;
    }
}

export class GoldItem extends Item {
    constructor(x, y) {
        super(x, y, 'Gold');
        this.amount = 25 + Math.floor(Math.random() * 25);
    }
    draw(ctx, time) {
        let px = this.x * TILE_SIZE + TILE_SIZE/2;
        let py = this.y * TILE_SIZE + TILE_SIZE/2 + Math.sin(time / 150 + this.floatOffset) * 6;
        
        let scaleX = Math.max(0.05, Math.abs(Math.cos(time / 200))); 
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(this.x * TILE_SIZE + TILE_SIZE/2, this.y * TILE_SIZE + TILE_SIZE/2 + 20, 12, 4, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#b7950b';
        ctx.beginPath(); ctx.ellipse(px, py, scaleX * 12, 12, 0, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = COLORS.GOLD;
        ctx.beginPath(); ctx.ellipse(px, py, scaleX * 10, 10, 0, 0, Math.PI * 2); ctx.fill();
        
        if (scaleX > 0.4) {
            ctx.fillStyle = '#b7950b'; ctx.fillRect(px - scaleX * 2, py - 4, scaleX * 4, 8);
        }
    }
}