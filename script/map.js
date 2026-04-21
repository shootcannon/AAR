import { TILE_SIZE, COLORS } from './constants.js';

export default class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = [];
        this.generateMap();
    }

    generateMap() {
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    row.push(1);
                } else {
                    row.push(Math.random() < 0.15 ? 1 : 0);
                }
            }
            this.data.push(row);
        }
        let cx = Math.floor(this.width/2), cy = Math.floor(this.height/2);
        this.data[cy][cx] = 0; this.data[cy-1][cx] = 0; this.data[cy+1][cx] = 0;
        this.data[cy][cx-1] = 0; this.data[cy][cx+1] = 0;
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.data[y][x] === 0; 
    }

    draw(ctx, camX, camY, canvasWidth, canvasHeight) {
        let startCol = Math.floor(camX / TILE_SIZE);
        let endCol = startCol + (canvasWidth / TILE_SIZE) + 1;
        let startRow = Math.floor(camY / TILE_SIZE);
        let endRow = startRow + (canvasHeight / TILE_SIZE) + 1;

        for (let y = Math.max(0, startRow); y < Math.min(this.height, endRow); y++) {
            for (let x = Math.max(0, startCol); x < Math.min(this.width, endCol); x++) {
                let px = x * TILE_SIZE, py = y * TILE_SIZE;
                
                if (this.data[y][x] === 1) {
                    ctx.fillStyle = COLORS.WALL_BASE; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS.WALL_TOP; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE/4);
                    ctx.strokeStyle = COLORS.WALL_BRICK; ctx.lineWidth = 2;
                    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.beginPath(); ctx.moveTo(px, py + TILE_SIZE/2); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE/2); ctx.stroke();
                } else {
                    ctx.fillStyle = COLORS.FLOOR_BASE; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    if ((x * 13 + y * 7) % 5 === 0) {
                        ctx.fillStyle = COLORS.FLOOR_DETAIL;
                        ctx.fillRect(px + TILE_SIZE/4, py + TILE_SIZE/4, 6, 6);
                    }
                }
            }
        }
    }
}