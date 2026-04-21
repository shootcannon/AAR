import GameMap from './map.js';
import { Player, Enemy, Chest } from './entity.js';
import { HealthPotion, GoldItem } from './items.js';
import { renderHUD, renderStory, renderGameOver, renderPauseScreen, ParticleSystem } from './ui.js';
import { TILE_SIZE, COLORS } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAP_W = 40, MAP_H = 40;
const map = new GameMap(MAP_W, MAP_H);
const player = new Player(Math.floor(MAP_W/2), Math.floor(MAP_H/2));
const particles = new ParticleSystem();
let messageLog = ["--- MISI DIMULAI ---", "Bersihkan area ini dan kumpulkan item di peti!"];
let items = [];
let enemies = [];
let chests = [];

function spawnWorld() {
    enemies.length = 0; items.length = 0; chests.length = 0;
    for(let i = 0; i < 40; i++) {
        let ex = Math.floor(Math.random() * MAP_W);
        let ey = Math.floor(Math.random() * MAP_H);
        if (map.isWalkable(ex, ey) && (ex !== player.x || ey !== player.y)) {
            let rand = Math.random();
            if (rand < 0.3) enemies.push(new Enemy(ex, ey, 'Slime'));
            else if (rand < 0.5) enemies.push(new Enemy(ex, ey, 'Goblin'));
            else if (rand < 0.6) enemies.push(new Enemy(ex, ey, 'Orc'));
            else if (rand < 0.8) chests.push(new Chest(ex, ey));
            else if (rand < 0.9) items.push(new HealthPotion(ex, ey));
            else items.push(new GoldItem(ex, ey));
        }
    }
}
spawnWorld();

let camX = player.px - canvas.width/2;
let camY = player.py - canvas.height/2;

let gameState = 'STORY';
let storyLines = [
    "Ugh... Dimana aku? Tempat ini bau anyir iblis.",
    "Kerajaan Valoria dulunya sangat damai sebelum kutukan itu datang...",
    "Mereka pikir mereka bisa membunuhku dan prajurit lainnya?",
    "Aku adalah Arthur! Aku manusia, bukan sekedar rongsokan armor mati!",
    "Pedang ini akan membelah kegelapan. Waktunya berburu!"
];
let currentStoryIndex = 0;
let storyCharIndex = 0;
let spacePressed = false;

const keys = {};

function handleKeyDown(key) {
    keys[key.toLowerCase()] = true;
    if (key === 'Escape') {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
        }
    }

    if (key === ' ' || key === 'Space') {
        keys[' '] = true; 
        if (gameState === 'STORY' && !spacePressed) {
            spacePressed = true;
            let line = storyLines[currentStoryIndex];
            if (storyCharIndex < line.length) storyCharIndex = line.length;
            else {
                currentStoryIndex++; storyCharIndex = 0;
                if (currentStoryIndex >= storyLines.length) {
                    gameState = 'PLAYING';
                }
            }
        }
    }
    if (key.toLowerCase() === 'h') {
        let res = player.useItem(0);
        if (res) messageLog.push(res);
    }
    if (gameState === 'GAMEOVER' && key.toLowerCase() === 'r') {
        player.hp = player.maxHp; player.isDead = false; player.deadTimer = 0;
        player.px = Math.floor(MAP_W/2) * TILE_SIZE; 
        player.py = Math.floor(MAP_H/2) * TILE_SIZE;
        player.inventory = []; player.gold = 0; player.xp = 0; player.level = 1;
        messageLog = ["--- BANGKIT KEMBALI ---", "Ksatria menolak untuk mati!"];
        spawnWorld();
        gameState = 'PLAYING';
        spacePressed = false;
    }
}

function handleKeyUp(key) {
    keys[key.toLowerCase()] = false;
    if (key === ' ' || key === 'Space') { keys[' '] = false; spacePressed = false; }
}

window.addEventListener('keydown', (e) => handleKeyDown(e.key));
window.addEventListener('keyup', (e) => handleKeyUp(e.key));

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const setupTouch = (id, key) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); handleKeyDown(key); });
    el.addEventListener('touchend', (e) => { e.preventDefault(); handleKeyUp(key); });
};

setupTouch('btn-up', 'w');
setupTouch('btn-down', 's');
setupTouch('btn-left', 'a');
setupTouch('btn-right', 'd');
setupTouch('btn-attack', ' ');
setupTouch('btn-potion', 'h');

let lastTime = performance.now();
let enemySpawnTimer = 0;
let storyTimer = 0;

function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    let dt = time - lastTime; lastTime = time;
    if (dt > 100) dt = 100;
    
    if (player.hp > 0 && gameState === 'PLAYING') {
        player.update(dt, keys, map);

        if (keys[' '] && player.attackCooldown <= 0) {
            player.attackCooldown = 400;
            for (let i = enemies.length - 1; i >= 0; i--) {
                let e = enemies[i];
                let dist = Math.hypot(player.px - e.px, player.py - e.py);
                if (dist < TILE_SIZE * 1.5) {
                    e.hp -= player.attack;
                    e.attackCooldown = 200;
                    particles.addText(`-${player.attack}`, e.px + TILE_SIZE/2, e.py, '#fff');
                    if (e.hp <= 0) {
                        messageLog.push(`Mengalahkan ${e.type}! (+${e.xp} XP)`);
                        player.xp += e.xp;
                        if (player.xp >= player.xpToNextLevel) {
                            player.level++; player.xp = 0; player.xpToNextLevel *= 1.5;
                            player.maxHp += 20; player.hp = player.maxHp; player.attack += 5;
                            particles.addText("LEVEL UP!", player.px, player.py - 20, COLORS.GOLD);
                        }
                        enemies.splice(i, 1);
                    }
                }
            }
            
            for (let i = chests.length - 1; i >= 0; i--) {
                let c = chests[i];
                let dist = Math.hypot(player.px - c.px, player.py - c.py);
                if (dist < TILE_SIZE * 1.5) {
                    c.hp -= player.attack;
                    c.attackCooldown = 200;
                    particles.addText(`*Brak!*`, c.px + TILE_SIZE/2, c.py, '#e67e22');
                    if (c.hp <= 0) {
                        messageLog.push(`Peti hancur! Mendapatkan harta karun.`);
                        if (Math.random() < 0.4) items.push(new HealthPotion(c.px / TILE_SIZE, c.py / TILE_SIZE));
                        else items.push(new GoldItem(c.px / TILE_SIZE, c.py / TILE_SIZE));
                        chests.splice(i, 1);
                    }
                }
            }
        }

        enemies.forEach(e => {
            e.update(dt, player, map);
            let dist = Math.hypot(player.px - e.px, player.py - e.py);
            if (dist < TILE_SIZE && e.attackCooldown <= 0 && e.hp > 0) {
                e.attackCooldown = 1500;
                if (player.hurtTimer <= 0) {
                    player.hp -= e.attack;
                    player.hurtTimer = 500;
                    particles.addText(`-${e.attack}`, player.px + TILE_SIZE/2, player.py, COLORS.DAMAGE_TEXT);
                    messageLog.push(`Diserang ${e.type}!`);
                    if (player.hp <= 0 && gameState === 'PLAYING') {
                        gameState = 'DYING';
                        messageLog.push("Ksatria Valoria telah tumbang...");
                    }
                } else {
                    particles.addText(`Blocked!`, player.px + TILE_SIZE/2, player.py, '#bdc3c7');
                }
            }
        });

        for (let i = items.length - 1; i >= 0; i--) {
            let itemPx = items[i].x * TILE_SIZE + TILE_SIZE/2;
            let itemPy = items[i].y * TILE_SIZE + TILE_SIZE/2;
            let dist = Math.hypot((player.px + TILE_SIZE/2) - itemPx, (player.py + TILE_SIZE/2) - itemPy);
            
            if (dist < TILE_SIZE) {
                if (items[i] instanceof GoldItem) {
                    player.gold += items[i].amount;
                    messageLog.push(`Dapat ${items[i].amount} Gold.`);
                } else {
                    player.inventory.push(items[i]);
                    messageLog.push("Menyimpan Health Potion.");
                }
                items.splice(i, 1);
            }
        }

        enemySpawnTimer += dt;
        if (enemies.length < 25 && enemySpawnTimer > 3000) {
            enemySpawnTimer = 0;
            let ex = Math.floor(Math.random() * MAP_W);
            let ey = Math.floor(Math.random() * MAP_H);
            let distToPlayer = Math.hypot(ex * TILE_SIZE - player.px, ey * TILE_SIZE - player.py);
            
            if (map.isWalkable(ex, ey) && distToPlayer > TILE_SIZE * 10) {
                let rand = Math.random();
                if (rand < 0.4) enemies.push(new Enemy(ex, ey, 'Slime'));
                else if (rand < 0.7) enemies.push(new Enemy(ex, ey, 'Goblin'));
                else enemies.push(new Enemy(ex, ey, 'Orc'));
                
                if (Math.random() < 0.2) messageLog.push("Terdengar geraman monster dari kegelapan...");
            }
        }
    } else if (gameState === 'STORY') {
        player.update(dt, {}, map);
        
        storyTimer += dt;
        if (storyTimer > 40) {
            if (storyCharIndex < storyLines[currentStoryIndex].length) storyCharIndex++;
            storyTimer = 0;
        }
    } else if (gameState === 'DYING') {
        player.update(dt, {}, map);
        if (player.deadTimer > 2000) gameState = 'GAMEOVER';
    } else if (gameState === 'GAMEOVER') {
        player.update(dt, {}, map);
    } else if (gameState === 'PAUSED') {
    }
    
    camX += (player.px - canvas.width/2 - camX) * 0.1;
    camY += (player.py - canvas.height/2 - camY) * 0.1;

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(camX), -Math.floor(camY));
    
    map.draw(ctx, camX, camY, canvas.width, canvas.height);
    chests.forEach(c => c.update(dt));
    chests.forEach(c => c.draw(ctx, time));
    items.forEach(i => i.draw(ctx, time));
    enemies.forEach(e => e.draw(ctx, time));
    player.draw(ctx, time);
    particles.updateAndDraw(ctx, dt);
    
    ctx.globalCompositeOperation = 'multiply';
    let grad = ctx.createRadialGradient(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, 50, player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, 400);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.restore();

    if (gameState === 'STORY') {
        let typedText = storyLines[currentStoryIndex].substring(0, storyCharIndex);
        renderStory(ctx, canvas.width, canvas.height, typedText, time);
    } else if (gameState === 'GAMEOVER') {
        let alpha = Math.min(1, (player.deadTimer - 2000) / 1000);
        renderGameOver(ctx, canvas.width, canvas.height, alpha);
    } else {
        renderHUD(ctx, player, canvas.width, canvas.height, messageLog);
        if (gameState === 'PAUSED') {
            renderPauseScreen(ctx, canvas.width, canvas.height);
        }
    }
}

requestAnimationFrame(gameLoop);
