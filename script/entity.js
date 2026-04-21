import { TILE_SIZE } from './constants.js';
import { HealthPotion } from './items.js';

export class Entity {
    constructor(x, y) {
        this.px = x * TILE_SIZE; this.py = y * TILE_SIZE;
        this.hp = 100; this.maxHp = 100;
        this.attackCooldown = 0;
        this.isMoving = false;
        this.isDead = false;
        this.deadTimer = 0;
    }
    
    canMoveTo(newPx, newPy, map) {
        const hitbox = 16;
        const left = Math.floor((newPx + hitbox) / TILE_SIZE);
        const right = Math.floor((newPx + TILE_SIZE - hitbox) / TILE_SIZE);
        const top = Math.floor((newPy + hitbox) / TILE_SIZE);
        const bottom = Math.floor((newPy + TILE_SIZE - hitbox) / TILE_SIZE);
        return map.isWalkable(left, top) && map.isWalkable(right, top) &&
               map.isWalkable(left, bottom) && map.isWalkable(right, bottom);
    }
}

export class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.gold = 0; this.attack = 20;
        this.level = 1; this.xp = 0; this.xpToNextLevel = 100;
        this.inventory = [];
        this.facingRight = true;
        this.speed = 220;
        this.hurtTimer = 0;
    }

    update(dt, keys, map) {
        if (this.hp <= 0) {
            this.isDead = true;
            this.deadTimer += dt;
            this.isMoving = false;
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;

        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            let len = Math.sqrt(dx*dx + dy*dy);
            dx /= len; dy /= len;
            
            if (dx > 0) this.facingRight = true;
            if (dx < 0) this.facingRight = false;

            let moveX = dx * this.speed * (dt / 1000);
            let moveY = dy * this.speed * (dt / 1000);

            if (this.canMoveTo(this.px + moveX, this.py, map)) this.px += moveX;
            if (this.canMoveTo(this.px, this.py + moveY, map)) this.py += moveY;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    draw(ctx, time) {
        let bob = (this.isMoving && !this.isDead) ? Math.sin(time / 100) * 4 : Math.sin(time / 200) * 2; 
        let cx = this.px + TILE_SIZE/2, cy = this.py + TILE_SIZE/2 + bob;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(this.px + TILE_SIZE/2, this.py + TILE_SIZE/2 + 20, 16, 6, 0, 0, Math.PI*2); ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.isDead) {
            let fallAngle = Math.min(Math.PI / 2, (this.deadTimer / 500) * (Math.PI / 2));
            ctx.rotate(fallAngle);
            ctx.translate(0, Math.min(15, (this.deadTimer / 500) * 15));
            
            ctx.fillStyle = `rgba(139, 0, 0, ${Math.min(0.8, this.deadTimer / 1000)})`;
            ctx.beginPath(); ctx.ellipse(0, 10, 25, 8, 0, 0, Math.PI*2); ctx.fill();
        } else if (this.hurtTimer > 0) {
            ctx.rotate(-Math.PI / 10);
            if (Math.floor(time / 80) % 2 === 0) {
                ctx.globalAlpha = 0.4;
            }
        }

        if (this.attackCooldown > 200 && !this.isDead) {
            ctx.fillStyle = 'rgba(236, 240, 241, 0.7)';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 45, -Math.PI/1.5, Math.PI/6, false); ctx.fill();
        }
        
        let capeWave = (this.isMoving && !this.isDead) ? Math.sin(time / 80) * 8 : (!this.isDead ? Math.sin(time / 200) * 4 : 0);
        ctx.fillStyle = '#641e16';
        ctx.beginPath(); ctx.moveTo(-8, -12); ctx.quadraticCurveTo(-20, capeWave, -15 - capeWave, 18); ctx.lineTo(-4, 15); ctx.fill();
        ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2; ctx.stroke();
        
        let walkCycle = (this.isMoving && !this.isDead) ? Math.sin(time / 80) : 0;
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath(); ctx.roundRect(-6 + walkCycle * 6, 8, 5, 14, 2); ctx.fill();
        ctx.beginPath(); ctx.roundRect(2 - walkCycle * 6, 8, 5, 14, 2); ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-7 + walkCycle * 6, 12, 7, 3); ctx.fillRect(1 - walkCycle * 6, 12, 7, 3);

        ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.roundRect(-12, -5, 8, 16, 4); ctx.fill();
        ctx.fillStyle = '#bdc3c7'; ctx.beginPath(); ctx.arc(-8, -4, 6, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = '#2980b9'; ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(-4, -4); ctx.lineTo(-4, 12); ctx.lineTo(-11, 20); ctx.lineTo(-18, 12); ctx.fill();
        ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-6, -2); ctx.lineTo(-6, 11); ctx.lineTo(-11, 17); ctx.lineTo(-16, 11); ctx.fill();
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-8, 6); ctx.lineTo(-14, 6); ctx.fill();

        let grad = ctx.createLinearGradient(0, -15, 0, 15);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#bdc3c7'); grad.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(-12, -12, 24, 26, 6); ctx.fill();
        ctx.fillStyle = '#8b0000'; ctx.fillRect(-12, 6, 24, 6);
        ctx.fillStyle = '#f1c40f'; ctx.fillRect(-4, 5, 8, 8);
        ctx.fillStyle = '#ecf0f1'; ctx.fillRect(-2, 7, 4, 4);

        ctx.fillStyle = '#d4ac0d'; ctx.beginPath(); ctx.arc(0, -23, 10.5, Math.PI, 0); ctx.fill(); 
        ctx.beginPath(); ctx.moveTo(-10, -23); ctx.lineTo(-14, -12); ctx.lineTo(-6, -20); ctx.fill();
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.roundRect(-11, -28, 22, 5, 2); ctx.fill();
        ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(0, -25.5, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath(); ctx.arc(0, -20, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, -20, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(5, -20, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#6e2c00'; ctx.fillRect(2, -24, 6, 1.5);

        ctx.save();
        ctx.translate(10, 5);
        if (this.attackCooldown > 0 && !this.isDead) ctx.rotate(Math.PI / 2);
        else ctx.rotate((this.isMoving && !this.isDead) ? Math.sin(time/100)*0.5 : -Math.PI / 8);
        
        ctx.fillStyle = '#bdc3c7'; ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(4, -38); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(0, -48); ctx.lineTo(4, -38); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(2, -35); ctx.lineTo(2, -2); ctx.lineTo(0, -2); ctx.fill();
        ctx.fillStyle = '#f1c40f'; ctx.fillRect(-10, -2, 20, 5);
        ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#5c4033'; ctx.fillRect(-2, 2, 4, 10);
        ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(0, 12, 3, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = '#bdc3c7'; ctx.beginPath(); ctx.roundRect(-6, -4, 12, 14, 4); ctx.fill();
        ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.arc(0, 10, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(0, -4, 6, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        ctx.restore();
    }
    
    useItem(index) {
        if (!this.inventory[index]) return null;
        let item = this.inventory[index];
        let oldHp = this.hp;
        let msg = item.use(this);
        if (this.hp > oldHp) this.inventory.splice(index, 1);
        return msg;
    }
}

export class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        if (type === 'Slime') { this.hp = 30; this.maxHp = 30; this.attack = 5; this.xp = 15; this.speed = 60;}
        else if (type === 'Goblin') { this.hp = 50; this.maxHp = 50; this.attack = 10; this.xp = 25; this.speed = 110;}
        else { this.hp = 90; this.maxHp = 90; this.attack = 15; this.xp = 50; this.speed = 45;}
    }

    update(dt, player, map) {
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        let dist = Math.hypot(player.px - this.px, player.py - this.py);
        
        if (dist < TILE_SIZE * 7 && dist > TILE_SIZE * 0.7) {
            let dx = (player.px - this.px) / dist;
            let dy = (player.py - this.py) / dist;
            
            let moveX = dx * this.speed * (dt / 1000);
            let moveY = dy * this.speed * (dt / 1000);

            if (this.canMoveTo(this.px + moveX, this.py, map)) this.px += moveX;
            if (this.canMoveTo(this.px, this.py + moveY, map)) this.py += moveY;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    draw(ctx, time) {
        let bob = this.isMoving ? Math.sin(time / 100) * 4 : Math.sin(time / 200) * 2; 
        let cx = this.px + TILE_SIZE/2, cy = this.py + TILE_SIZE/2 + bob;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(this.px + TILE_SIZE/2, this.py + TILE_SIZE/2 + 20, 18, 6, 0, 0, Math.PI*2); ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);

        if (this.attackCooldown > 0) {
            ctx.filter = 'drop-shadow(0px 0px 8px red) brightness(2) saturate(3)';
        }

        if (this.type === 'Slime') {
            let squish = Math.sin(time / 150) * 4;
            ctx.translate(0, 10 - squish/2);
            
            ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
            ctx.beginPath(); ctx.ellipse(0, 0, 22 + squish, 16 - squish, 0, 0, Math.PI * 2); ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath(); ctx.arc(8, -2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(2, 6, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-10, 4, 1.5, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath(); ctx.ellipse(-8, -8, 6, 3, Math.PI/6, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#145a32'; ctx.beginPath(); ctx.arc(-6, 0, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, 0, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6.5, -0.5, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(5.5, -0.5, 1, 0, Math.PI*2); ctx.fill();

        } else if (this.type === 'Goblin') {
            ctx.scale(-1, 1);
            
            ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.roundRect(-10, -4, 6, 12, 3); ctx.fill();
            ctx.fillStyle = '#5c4033'; ctx.beginPath(); ctx.arc(-8, 5, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#3e2723'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-16, 5); ctx.lineTo(0, 5); ctx.stroke();
            
            ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.roundRect(-10, -10, 20, 20, 4); ctx.fill();
            ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(-5, 5); ctx.lineTo(0, 10); ctx.lineTo(5, 5); ctx.lineTo(10, 10); ctx.lineTo(10, -10); ctx.lineTo(-10, -10); ctx.fill();
            ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, 6); ctx.lineWidth = 3; ctx.stroke();
            
            ctx.save();
            ctx.translate(6, 0);
            if (this.attackCooldown > 0) ctx.rotate(Math.PI / 2); else ctx.rotate(-Math.PI / 6);
            ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.moveTo(-2, -15); ctx.lineTo(2, -15); ctx.lineTo(0, -25); ctx.fill();
            ctx.fillStyle = '#7f8c8d'; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(2, -15); ctx.lineTo(0, -23); ctx.fill();
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-2, -15, 4, 10);
            ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.roundRect(-4, -4, 8, 12, 4); ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(0, -16, 10, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(6, -18); ctx.lineTo(20, -15 + bob); ctx.lineTo(6, -12); ctx.fill();
            ctx.fillStyle = '#1e8449'; ctx.beginPath(); ctx.moveTo(8, -17); ctx.lineTo(18, -15 + bob); ctx.lineTo(8, -13); ctx.fill();
            ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(4, -18, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(6, -12); ctx.lineTo(7, -9); ctx.lineTo(8, -12); ctx.fill();

        } else {
            ctx.scale(-1, 1);
            const orcSkin = '#1e8449'; 
            
            ctx.fillStyle = orcSkin; ctx.beginPath(); ctx.roundRect(-16, -6, 10, 18, 5); ctx.fill();
            ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.roundRect(-16, -15, 32, 28, 6); ctx.fill();
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-12, -10, 24, 5); ctx.fillRect(-12, 0, 24, 5);
            ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 6); ctx.fill();

            ctx.save();
            ctx.translate(14, 0);
            if (this.attackCooldown > 0) ctx.rotate(Math.PI / 1.5); else ctx.rotate(-Math.PI / 8);
            ctx.fillStyle = '#5c4033'; ctx.beginPath(); ctx.roundRect(-4, -35, 8, 45, 4); ctx.fill();
            ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.roundRect(-6, -35, 12, 15, 4); ctx.fill();
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath(); ctx.moveTo(-8, -32); ctx.lineTo(-12, -30); ctx.lineTo(-8, -28); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, -32); ctx.lineTo(12, -30); ctx.lineTo(8, -28); ctx.fill();
            ctx.fillStyle = orcSkin; ctx.beginPath(); ctx.roundRect(-6, -6, 12, 16, 5); ctx.fill();
            
            ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.arc(0, -6, 10, Math.PI, 0); ctx.fill(); 
            ctx.fillStyle = '#bdc3c7'; 
            ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-10, -14); ctx.lineTo(-4, -10); ctx.fill();
            ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(6, -16); ctx.lineTo(8, -6); ctx.fill();
            ctx.restore();

            ctx.fillStyle = orcSkin; ctx.beginPath(); ctx.arc(0, -22, 12, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(-8, -14, 16, 6);
            ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(6, -14); ctx.lineTo(8, -8); ctx.fill();
            
            ctx.fillStyle = '#ff0000'; ctx.shadowBlur = 10; ctx.shadowColor = 'red';
            ctx.beginPath(); ctx.arc(5, -23, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(5, -23); ctx.quadraticCurveTo(15, -26, 18, -20); ctx.lineTo(5, -21); ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}

export class Chest extends Entity {
    constructor(x, y) {
        super(x, y);
        this.hp = 40; this.maxHp = 40;
        this.type = 'Chest';
    }
    
    update(dt) {
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
    }
    
    draw(ctx, time) {
        let cx = this.px + TILE_SIZE/2, cy = this.py + TILE_SIZE/2;
        
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 15, 20, 6, 0, 0, Math.PI*2); ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        
        if (this.attackCooldown > 0) {
            ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            ctx.filter = 'brightness(1.5) sepia(1)';
        }

        ctx.fillStyle = '#4a2311'; ctx.beginPath(); ctx.roundRect(-18, -12, 36, 26, 4); ctx.fill();
        ctx.fillStyle = '#795548'; ctx.fillRect(-15, -9, 30, 20);
        ctx.fillStyle = '#5d4037'; ctx.fillRect(-15, -4, 30, 2); ctx.fillRect(-15, 4, 30, 2);
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-12, -12, 6, 26); ctx.fillRect(6, -12, 6, 26);
        
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.fillRect(-1, -1, 2, 3);
        ctx.restore();
    }
}