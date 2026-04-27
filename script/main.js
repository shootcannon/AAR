import GameMap from './map.js';
import { Player } from './entity.js';
import { renderHUD, renderMinimap, renderStory, renderWin, renderPauseScreen, renderDeathScreen, renderMapSelectionScreen, renderSkillBar, ParticleSystem } from './ui.js';
import { TILE_SIZE, COLORS, TARGET_FPS, SKILLS } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAP_W = 31, MAP_H = 31;
let map = new GameMap(MAP_W, MAP_H);
let player = new Player(map.startX, map.startY);
const particles = new ParticleSystem();
let messageLog = ["--- LABIRIN DIMULAI ---", "Arthur berjalan otomatis. Cari kunci, buka gerbang!"];

const MAP_CONFIGS = [
    { name: "Labirin Pemula", width: 21, height: 21, obstacleDensity: 0.02, description: "Labirin kecil, sedikit jebakan." },
    { name: "Labirin Klasik", width: 31, height: 31, obstacleDensity: 0.05, description: "Ukuran standar, jebakan moderat." },
    { name: "Labirin Sulit", width: 41, height: 41, obstacleDensity: 0.08, description: "Lebih besar, banyak jebakan!" },
    { name: "Labirin Ekstrem", width: 51, height: 51, obstacleDensity: 0.10, description: "Sangat besar, jebakan di mana-mana!" },
    { name: "Labirin Tanpa Jebakan", width: 31, height: 31, obstacleDensity: 0, description: "Fokus pada navigasi, tanpa jebakan." }
];
let currentMapSelectionIndex = 0;

let phase = 'TO_GATE';
let statusText = 'Menuju gerbang...';

function planNextPath() {
    if (!map.keyTaken && !map.gateOpen) {
        // 1. Coba cari jalan aman ke gerbang
        let path = map.findPath(player.tileX, player.tileY, map.gateApproachX, map.gateApproachY, true, true);
        
        // 2. Jika tidak ada jalan aman, coba ambil kunci (aman)
        if (!path || path.length <= 1) {
            path = map.findPath(player.tileX, player.tileY, map.keyX, map.keyY, true, true);
        }

        // 3. FALLBACK: Jika masih buntu karena jebakan, cari jalan apa saja (berisiko mati)
        if (!path || path.length <= 1) {
            path = map.findPath(player.tileX, player.tileY, map.keyX, map.keyY, true, false);
        }

        if (path) {
            statusText = map.keyTaken ? 'Kembali ke gerbang...' : 'Mencari kunci...';
            player.setPath(path);
            return;
        }
    } else if (map.keyTaken && !map.gateOpen) {
        // Ke gerbang untuk buka
        let toGate = map.findPath(player.tileX, player.tileY, map.gateX, map.gateY, false, true);
        if (!toGate) toGate = map.findPath(player.tileX, player.tileY, map.gateX, map.gateY, false, false);
        if (toGate) {
            phase = 'TO_GATE';
            statusText = 'Kembali ke gerbang...';
            player.setPath(toGate);
            return;
        }
    } else {
        let toExit = map.findPath(player.tileX, player.tileY, map.exitX, map.exitY, true, true);
        if (!toExit) toExit = map.findPath(player.tileX, player.tileY, map.exitX, map.exitY, true, false);
        if (toExit) {
            phase = 'TO_EXIT';
            statusText = 'Menuju keluar...';
            player.setPath(toExit);
            return;
        }
    }
}

function initialPlan() { planNextPath(); }
// initialPlan is now called by createNewGame, not at global scope

let camX = player.px - canvas.width / 2;
let camY = player.py - canvas.height / 2;

let gameState = 'MAP_SELECT'; // Initial game state is now map selection
const storyLines = [
    "Labirin kuno ini menelan banyak penjelajah...",
    "Aku akan berjalan sendiri — kakiku tahu jalannya.",
    "Tapi gerbang besi di tengah menutup jalan keluar.",
    "Harus kembali, cari kunci, lalu kembali lagi ke gerbang.",
    "Mulai!"
];
let currentStoryIndex = 0;
let storyCharIndex = 0;
let spacePressed = false;

const keys = {};

function createNewGame(mapConfig) {
    map = new GameMap(mapConfig.width, mapConfig.height, mapConfig.obstacleDensity);
    player = new Player(map.startX, map.startY);
    messageLog = ["--- LABIRIN DIMULAI ---", "Arthur berjalan otomatis. Cari kunci, buka gerbang!"];
    phase = 'TO_GATE';
    statusText = 'Menuju gerbang...';
    initialPlan();
    camX = player.px - canvas.width / 2;
    camY = player.py - canvas.height / 2;
    currentStoryIndex = 0; // Reset story for new game
    storyCharIndex = 0;    // Reset story for new game
    spacePressed = false;  // Reset for new game
}

function resetGame() {
    createNewGame(MAP_CONFIGS[currentMapSelectionIndex]);
}

function handleKeyDown(key) {
    keys[key.toLowerCase()] = true;
    if (key === 'Escape') {
        if (gameState === 'PLAYING') gameState = 'PAUSED';
        else if (gameState === 'PAUSED') gameState = 'PLAYING';
    }
    if (gameState === 'MAP_SELECT') {
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
            currentMapSelectionIndex = Math.max(0, currentMapSelectionIndex - 1);
        } else if (key === 'ArrowRight' || key === 'ArrowDown') {
            currentMapSelectionIndex = Math.min(MAP_CONFIGS.length - 1, currentMapSelectionIndex + 1);
        } else if (key === 'Enter' || key === ' ') {
            if (!spacePressed) { // Prevent multiple triggers on hold
                spacePressed = true;
                createNewGame(MAP_CONFIGS[currentMapSelectionIndex]);
                gameState = 'STORY'; // Start story after map selection
            }
        }
        return; // Don't process other keys in map select state
    }
    if (gameState === 'DEAD' && key.toLowerCase() === 'r') {
        resetGame();
        gameState = 'MAP_SELECT'; // Go back to map selection after death
        return;
    }

    // Manual Skill Handling
    if (gameState === 'PLAYING') {
        if (key === '1' && player.cooldowns.jump <= 0) {
            player.activeSkills.jump = SKILLS.JUMP.duration;
            player.cooldowns.jump = SKILLS.JUMP.cd;
            particles.addText("JUMP!", player.px + 32, player.py, '#fff');
        }
        if (key === '2' && player.cooldowns.dash <= 0) {
            player.activeSkills.dash = SKILLS.DASH.duration;
            player.cooldowns.dash = SKILLS.DASH.cd;
            particles.addText("DASH!", player.px + 32, player.py, '#3498db');
        }
        if (key === '3' && player.cooldowns.shield <= 0) {
            player.activeSkills.shield = SKILLS.SHIELD.duration;
            player.cooldowns.shield = SKILLS.SHIELD.cd;
            particles.addText("SHIELD!", player.px + 32, player.py, '#f1c40f');
        }
        if (key === '4' && player.cooldowns.blink <= 0) {
            // Blink 2 tiles forward on current path
            const targetIdx = Math.min(player.pathIndex + 2, player.path.length - 1);
            if (player.path[targetIdx]) {
                const [tx, ty] = player.path[targetIdx];
                player.px = tx * TILE_SIZE;
                player.py = ty * TILE_SIZE;
                player.tileX = tx;
                player.tileY = ty;
                player.pathIndex = targetIdx;
                player.cooldowns.blink = SKILLS.BLINK.cd;
                particles.addText("BLINK!", player.px + 32, player.py, '#9b59b6');
            }
        }
        if (key === '5' && player.cooldowns.slow <= 0) {
            player.activeSkills.slow = SKILLS.SLOW.duration;
            player.cooldowns.slow = SKILLS.SLOW.cd;
            particles.addText("SLOW!", player.px + 32, player.py, '#2ecc71');
        }
    }

    if (key === ' ' || key === 'Space') {
        if (gameState === 'STORY' && !spacePressed) {
            spacePressed = true;
            const line = storyLines[currentStoryIndex];
            if (storyCharIndex < line.length) storyCharIndex = line.length;
            else {
                currentStoryIndex++; storyCharIndex = 0;
                if (currentStoryIndex >= storyLines.length) {
                    gameState = 'PLAYING';
                    planNextPath(); // Paksa Arthur jalan setelah cerita selesai
                }
            }
        }
    }
    if ((gameState === 'WIN' || gameState === 'PAUSED') && key.toLowerCase() === 'r') { // Allow restart from WIN or PAUSED
        resetGame(); // This will create a new game with the *currently selected* map config
        gameState = 'MAP_SELECT'; // Go back to map selection after win
    }
}

function handleKeyUp(key) {
    keys[key.toLowerCase()] = false;
    if (key === ' ' || key === 'Space' || key === 'Enter') spacePressed = false;
}

window.addEventListener('keydown', (e) => handleKeyDown(e.key));
window.addEventListener('keyup', (e) => handleKeyUp(e.key));
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let lastTime = performance.now();
let storyTimer = 0;
const FRAME_TARGET_MS = 1000 / TARGET_FPS;
let fpsFrames = 0;
let fpsLastUpdate = performance.now();
let fpsCurrent = 0;

let winTimer = 0;

let deathTimer = 0; // New timer for death screen

function onTileEntered(tx, ty) {
    if (map.isLethal(tx, ty) && !player.isInvulnerable()) {
        gameState = 'DEAD';
        messageLog.push("Arthur terkena jebakan!");
        particles.addText("MATI!", player.px + TILE_SIZE / 2, player.py, '#e74c3c');
        return; // Stop further processing for this tile
    }

    if (map.pickUpKey(tx, ty)) {
        messageLog.push("Kunci didapat! Kembali ke gerbang.");
        particles.addText("KUNCI!", player.px + TILE_SIZE / 2, player.py, '#f1c40f');
        planNextPath();
    } else if (tx === map.gateX && ty === map.gateY && map.gateOpen) {
        // already open, keep going
    } else if (map.tryOpenGate(tx, ty)) {
        messageLog.push("Gerbang terbuka!");
        particles.addText("TERBUKA!", player.px + TILE_SIZE / 2, player.py, '#2ecc71');
        planNextPath();
    } else if (map.isExit(tx, ty)) {
        if (gameState === 'PLAYING') {
            gameState = 'WIN';
            winTimer = 0;
            messageLog.push("Sampai di EXIT!");
        }
    }
}

function update(dt) {
    if (gameState !== 'PLAYING') return;
    
    // Adjust dt if Time Slow is active
    const effectiveDt = player.activeSkills.slow > 0 ? dt * 0.4 : dt;

    const prevTileX = player.tileX, prevTileY = player.tileY;
    player.update(effectiveDt);
    if (player.tileX !== prevTileX || player.tileY !== prevTileY) {
        onTileEntered(player.tileX, player.tileY);
    }

    if (player.pathIndex >= player.path.length && gameState === 'PLAYING') {
        if (phase === 'TO_GATE' && !map.keyTaken) {
            messageLog.push("Gerbang terkunci! Backtrack ke kunci.");
            statusText = 'Gerbang terkunci!';
            const toKey = map.findPath(player.tileX, player.tileY, map.keyX, map.keyY, true, true); // avoidLethal
            if (toKey) {
                phase = 'TO_KEY';
                statusText = 'Backtrack: ambil kunci...';
                player.setPath(toKey);
            }
        } else if (!map.isExit(player.tileX, player.tileY)) {
            planNextPath();
        }
    }
}

function gameLoop() {
    const time = performance.now();
    let dt = time - lastTime; lastTime = time;
    if (dt > 100) dt = 100;

    fpsFrames++;
    if (time - fpsLastUpdate >= 500) {
        fpsCurrent = Math.round((fpsFrames * 1000) / (time - fpsLastUpdate));
        fpsFrames = 0;
        fpsLastUpdate = time;
    }

    if (gameState === 'PLAYING') {
        update(dt);
    } else if (gameState === 'STORY') {
        storyTimer += dt;
        if (storyTimer > 40) {
            if (storyCharIndex < storyLines[currentStoryIndex].length) storyCharIndex++;
            storyTimer = 0;
        }
    } else if (gameState === 'WIN') {
        winTimer += dt;
    } else if (gameState === 'DEAD') {
        deathTimer += dt; // Update death timer for potential animation
    }

    camX += (player.px - canvas.width / 2 - camX) * 0.1;
    camY += (player.py - canvas.height / 2 - camY) * 0.1;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.floor(camX), -Math.floor(camY));
    map.draw(ctx, camX, camY, canvas.width, canvas.height, time);
    player.draw(ctx, time);
    particles.updateAndDraw(ctx, dt);

    ctx.globalCompositeOperation = 'multiply';
    const grad = ctx.createRadialGradient(
        player.px + TILE_SIZE / 2, player.py + TILE_SIZE / 2, 60,
        player.px + TILE_SIZE / 2, player.py + TILE_SIZE / 2, 420
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    if (gameState === 'STORY') {
        const typedText = storyLines[currentStoryIndex].substring(0, storyCharIndex);
        renderStory(ctx, canvas.width, canvas.height, typedText, time);
    } else if (gameState === 'WIN') {
        const alpha = Math.min(1, winTimer / 1000);
        renderWin(ctx, canvas.width, canvas.height, alpha);
    } else if (gameState === 'DEAD') {
        renderDeathScreen(ctx, canvas.width, canvas.height);
    } else if (gameState === 'MAP_SELECT') {
        renderMapSelectionScreen(ctx, canvas.width, canvas.height, MAP_CONFIGS, currentMapSelectionIndex);
    } else {
        renderHUD(ctx, player, map, canvas.width, canvas.height, messageLog, statusText);
        renderMinimap(ctx, map, player, canvas.width, canvas.height);
        if (gameState === 'PAUSED') {
            renderPauseScreen(ctx, canvas.width, canvas.height);
        }
    }

    ctx.font = '18px "VT323", monospace';
    const fpsLabel = `FPS: ${fpsCurrent} / target ${TARGET_FPS}`;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(canvas.width - 170, 8, 160, 24);
    ctx.fillStyle = fpsCurrent >= TARGET_FPS * 0.9 ? '#2ecc71'
                   : fpsCurrent >= TARGET_FPS * 0.6 ? '#f1c40f' : '#e74c3c';
    ctx.fillText(fpsLabel, canvas.width - 162, 26);

    const elapsed = performance.now() - time;
    const delay = Math.max(0, FRAME_TARGET_MS - elapsed);
    setTimeout(gameLoop, delay);
}

gameLoop(); // Start the game loop, which will begin in MAP_SELECT state
