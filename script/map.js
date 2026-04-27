import { TILE_SIZE, COLORS } from './constants.js';

export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_KEY = 2;
export const TILE_GATE = 3; // Gate is a special wall that can be opened
export const TILE_EXIT = 4;
export const TILE_FIRE = 5; // New obstacle type: fire trap
export const TILE_ARROW_TRAP = 6; // New obstacle type: arrow trap

export default class GameMap {
    constructor(width, height, obstacleDensity = 0.05) { // Added obstacleDensity parameter
        if (width % 2 === 0) width++;
        if (height % 2 === 0) height++;
        this.width = width;
        this.height = height;
        this.data = [];
        this.startX = 1;
        this.startY = 1;
        this.exitX = width - 2;
        this.exitY = height - 2;
        this.keyX = 0;
        this.keyY = 0;
        this.gateX = 0;
        this.gateY = 0;
        this.gateApproachX = this.startX;
        this.gateApproachY = this.startY;
        this.gateOpen = false;
        this.keyTaken = false;
        this.obstacleDensity = obstacleDensity; // Store obstacle density
        this.generateMap();
    }

    generateMap() {
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) row.push(TILE_WALL);
            this.data.push(row);
        }

        const stack = [[this.startX, this.startY]];
        this.data[this.startY][this.startX] = TILE_FLOOR;
        while (stack.length > 0) {
            const [cx, cy] = stack[stack.length - 1];
            const neighbors = [];
            const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];
            for (const [dx, dy] of dirs) {
                const nx = cx + dx, ny = cy + dy;
                if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1
                    && this.data[ny][nx] === TILE_WALL) {
                    neighbors.push([nx, ny, dx, dy]);
                }
            }
            if (neighbors.length === 0) {
                stack.pop();
                continue;
            }
            const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.data[cy + dy / 2][cx + dx / 2] = TILE_FLOOR;
            this.data[ny][nx] = TILE_FLOOR;
            stack.push([nx, ny]);
        }

        this.data[this.exitY][this.exitX] = TILE_EXIT;

        const path = this.findPath(this.startX, this.startY, this.exitX, this.exitY, true);
        if (path && path.length >= 8) {
            const gateIdx = Math.max(2, Math.floor(path.length * 0.55));
            const [gx, gy] = path[gateIdx];
            this.gateX = gx;
            this.gateY = gy;
            const [agx, agy] = path[gateIdx - 1];
            this.gateApproachX = agx;
            this.gateApproachY = agy;
            this.data[gy][gx] = TILE_GATE;

            const reachable = this.floodFromStartAvoidingGate();
            let bestKey = null;
            let bestDist = -1;
            for (let y = 1; y < this.height - 1; y++) {
                for (let x = 1; x < this.width - 1; x++) {
                    if (!reachable[y][x]) continue;
                    if (this.data[y][x] !== TILE_FLOOR) continue;
                    if (x === this.startX && y === this.startY) continue;
                    const onSolution = path.some(([px, py]) => px === x && py === y);
                    if (onSolution) continue;
                    const d = Math.abs(x - this.startX) + Math.abs(y - this.startY);
                    if (d > bestDist) { bestDist = d; bestKey = [x, y]; }
                }
            }
            if (!bestKey) {
                for (let y = 1; y < this.height - 1; y++) {
                    for (let x = 1; x < this.width - 1; x++) {
                        if (reachable[y][x] && this.data[y][x] === TILE_FLOOR
                            && !(x === this.startX && y === this.startY)) {
                            bestKey = [x, y]; break;
                        }
                    }
                    if (bestKey) break;
                }
            }
            this.keyX = bestKey[0];
            this.keyY = bestKey[1];
            this.data[this.keyY][this.keyX] = TILE_KEY;
        }

        // Place obstacles
        const floorTiles = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.data[y][x] === TILE_FLOOR) {
                    floorTiles.push([x, y]);
                }
            }
        }

        // Remove key, gate, exit, start from potential obstacle spots
        const criticalTiles = [[this.startX, this.startY], [this.keyX, this.keyY], [this.gateX, this.gateY], [this.exitX, this.exitY]];
        const nonCriticalFloorTiles = floorTiles.filter(([x, y]) =>
            !criticalTiles.some(ct => ct[0] === x && ct[1] === y)
        );

        const numObstacles = Math.floor(nonCriticalFloorTiles.length * this.obstacleDensity);
        for (let i = 0; i < numObstacles; i++) {
            if (nonCriticalFloorTiles.length === 0) break;
            const randomIndex = Math.floor(Math.random() * nonCriticalFloorTiles.length);
            const [ox, oy] = nonCriticalFloorTiles.splice(randomIndex, 1)[0];
            this.data[oy][ox] = Math.random() < 0.5 ? TILE_FIRE : TILE_ARROW_TRAP;
        }
    }

    floodFromStartAvoidingGate() {
        const visited = [];
        for (let y = 0; y < this.height; y++) {
            visited.push(new Array(this.width).fill(false));
        }
        const queue = [[this.startX, this.startY]];
        visited[this.startY][this.startX] = true;
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
                if (visited[ny][nx]) continue;
                // Avoid walls, gates, and lethal tiles when determining reachable areas for key placement
                if (this.data[ny][nx] === TILE_WALL || this.data[ny][nx] === TILE_GATE || this.isLethal(nx, ny)) continue;
                visited[ny][nx] = true;
                queue.push([nx, ny]);
            }
        }
        return visited;
    }

    findPath(sx, sy, ex, ey, gateBlocks, avoidLethal = false) { // Added avoidLethal parameter
        const visited = [];
        for (let y = 0; y < this.height; y++) {
            visited.push(new Array(this.width).fill(null));
        }
        const queue = [[sx, sy]];
        visited[sy][sx] = [sx, sy];
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            if (x === ex && y === ey) {
                const path = [];
                let cx = x, cy = y;
                while (!(cx === sx && cy === sy)) {
                    path.unshift([cx, cy]);
                    [cx, cy] = visited[cy][cx];
                }
                path.unshift([sx, sy]);
                return path;
            }
            const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
                if (visited[ny][nx]) continue;
                const t = this.data[ny][nx];
                if (t === TILE_WALL) continue;
                if (avoidLethal && this.isLethal(nx, ny)) continue; // Avoid lethal tiles if requested
                if (gateBlocks && t === TILE_GATE && !this.gateOpen) continue;
                visited[ny][nx] = [x, y];
                queue.push([nx, ny]);
            }
        }
        return null;
    }

    isLethal(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const t = this.data[y][x];
        return t === TILE_FIRE || t === TILE_ARROW_TRAP;
    }

    // isWalkable is not used by player movement directly, but by pathfinding.
    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const t = this.data[y][x];
        if (t === TILE_WALL) return false;
        if (t === TILE_GATE && !this.gateOpen) return false;
        return true;
    }

    pickUpKey(x, y) {
        if (x === this.keyX && y === this.keyY && !this.keyTaken) {
            this.keyTaken = true;
            this.data[y][x] = TILE_FLOOR;
            return true;
        }
        return false;
    }

    tryOpenGate(x, y) {
        if (x === this.gateX && y === this.gateY && this.keyTaken && !this.gateOpen) {
            this.gateOpen = true;
            return true;
        }
        return false;
    }

    isExit(x, y) {
        return x === this.exitX && y === this.exitY;
    }

    draw(ctx, camX, camY, canvasWidth, canvasHeight, time) {
        const startCol = Math.floor(camX / TILE_SIZE);
        const endCol = startCol + Math.ceil(canvasWidth / TILE_SIZE) + 1;
        const startRow = Math.floor(camY / TILE_SIZE);
        const endRow = startRow + Math.ceil(canvasHeight / TILE_SIZE) + 1;

        for (let y = Math.max(0, startRow); y < Math.min(this.height, endRow); y++) {
            for (let x = Math.max(0, startCol); x < Math.min(this.width, endCol); x++) {
                const px = x * TILE_SIZE, py = y * TILE_SIZE;
                const t = this.data[y][x];

                if (t === TILE_WALL) {
                    ctx.fillStyle = COLORS.WALL_BASE; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS.WALL_TOP; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE / 4);
                    ctx.strokeStyle = COLORS.WALL_BRICK; ctx.lineWidth = 2;
                    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.beginPath(); ctx.moveTo(px, py + TILE_SIZE / 2); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE / 2); ctx.stroke();
                } else {
                    ctx.fillStyle = COLORS.FLOOR_BASE; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    if ((x * 13 + y * 7) % 5 === 0) {
                        ctx.fillStyle = COLORS.FLOOR_DETAIL;
                        ctx.fillRect(px + TILE_SIZE / 4, py + TILE_SIZE / 4, 6, 6);
                    }

                    if (t === TILE_KEY && !this.keyTaken) {
                        const bob = Math.sin((time || 0) / 300) * 4;
                        const cx = px + TILE_SIZE / 2;
                        const cy = py + TILE_SIZE / 2 + bob;
                        ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
                        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#f1c40f';
                        ctx.beginPath(); ctx.arc(cx - 6, cy, 6, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = COLORS.FLOOR_BASE;
                        ctx.beginPath(); ctx.arc(cx - 6, cy, 2.5, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#f1c40f';
                        ctx.fillRect(cx - 2, cy - 2, 14, 4);
                        ctx.fillRect(cx + 8, cy + 2, 3, 4);
                        ctx.fillRect(cx + 4, cy + 2, 3, 3);
                    } else if (t === TILE_GATE && !this.gateOpen) {
                        ctx.fillStyle = '#1a1108';
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                        ctx.fillStyle = '#3e2723';
                        for (let i = 0; i < 4; i++) {
                            ctx.fillRect(px + 4 + i * 14, py + 4, 12, TILE_SIZE - 8);
                        }
                        ctx.fillStyle = '#7f8c8d';
                        ctx.fillRect(px + 6, py + 16, TILE_SIZE - 12, 4);
                        ctx.fillRect(px + 6, py + TILE_SIZE - 20, TILE_SIZE - 12, 4);
                        ctx.fillStyle = '#f1c40f';
                        ctx.beginPath(); ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 5, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#000';
                        ctx.fillRect(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 1, 2, 4);
                    } else if (t === TILE_EXIT) {
                        const pulse = 0.4 + Math.sin((time || 0) / 200) * 0.2;
                        ctx.fillStyle = `rgba(46, 204, 113, ${pulse})`;
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 3;
                        ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                        ctx.fillStyle = '#fff';
                        ctx.font = '24px "VT323", monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText('EXIT', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 8);
                        ctx.textAlign = 'start';
                    } else if (t === TILE_FIRE) {
                        const pulse = 0.5 + Math.sin((time || 0) / 150) * 0.5; // Pulsing effect
                        ctx.fillStyle = `rgba(231, 76, 60, ${pulse})`; // Red base
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                        ctx.fillStyle = `rgba(241, 196, 15, ${pulse * 0.8})`; // Yellow-orange flame
                        ctx.beginPath();
                        ctx.moveTo(px + TILE_SIZE / 2, py + TILE_SIZE / 4);
                        ctx.lineTo(px + TILE_SIZE / 4, py + TILE_SIZE * 3 / 4);
                        ctx.lineTo(px + TILE_SIZE * 3 / 4, py + TILE_SIZE * 3 / 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = `rgba(255, 165, 0, ${pulse * 0.6})`; // Orange inner flame
                        ctx.beginPath();
                        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE * 0.7, TILE_SIZE / 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.textAlign = 'start';
                    } else if (t === TILE_ARROW_TRAP) {
                        ctx.fillStyle = '#34495e'; // Dark blue-grey for trap base
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 2; // Grey for spikes
                        ctx.beginPath();
                        ctx.moveTo(px + TILE_SIZE / 4, py + TILE_SIZE / 4);
                        ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE / 8);
                        ctx.lineTo(px + TILE_SIZE * 3 / 4, py + TILE_SIZE / 4);
                        ctx.moveTo(px + TILE_SIZE / 2, py + TILE_SIZE / 8);
                        ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE * 7 / 8);
                        ctx.moveTo(px + TILE_SIZE / 4, py + TILE_SIZE * 3 / 4);
                        ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE * 7 / 8);
                        ctx.lineTo(px + TILE_SIZE * 3 / 4, py + TILE_SIZE * 3 / 4);
                        ctx.stroke();
                        ctx.textAlign = 'start';
                    }
                }
            }
        }
    }
}
