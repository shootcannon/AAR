export const TILE_SIZE = 64;
export const TARGET_FPS = 120;

export const COLORS = {
    FLOOR_BASE: '#2c2c2c',
    FLOOR_DETAIL: '#222222',
    WALL_BASE: '#3a3f47',
    WALL_TOP: '#4d545e',
    WALL_BRICK: '#2a2e35',
    UI_BG: 'rgba(15, 15, 20, 0.85)',
    UI_TEXT: '#e0e0e0',
    HP_FULL: '#e74c3c',
    HP_EMPTY: '#4a2323',
    XP_FULL: '#2ecc71',
    XP_EMPTY: '#1d4a2d',
    GOLD: '#f1c40f',
    POTION: '#9b59b6',
    DAMAGE_TEXT: '#ff5252',
    SKILL_READY: '#2ecc71',
    SKILL_COOLDOWN: '#e74c3c'
};

export const SKILLS = {
    JUMP: { id: 'jump', key: '1', cd: 2000, duration: 600 },
    DASH: { id: 'dash', key: '2', cd: 4000, duration: 400 },
    SHIELD: { id: 'shield', key: '3', cd: 8000, duration: 2000 },
    BLINK: { id: 'blink', key: '4', cd: 5000 },
    SLOW: { id: 'slow', key: '5', cd: 12000, duration: 3000 }
};