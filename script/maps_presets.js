export const MAP_PRESETS = [
    {
        id: 'embers',
        name: 'Crypt of Embers',
        desc: 'Pancuran api menyembur dari lubang lantai. Tunggu padam, lalu lewat.',
        hazardType: 'fire',
        hazardCount: 5,
        size: 25,
        palette: {
            wallBase: '#3a1f1f',
            wallTop: '#5a2c2c',
            wallBrick: '#1a0808',
            floorBase: '#241616',
            floorDetail: '#180c0c',
            ambient: 'rgba(255, 80, 30, 0.08)'
        },
        accent: '#e74c3c',
        seed: 1337
    },
    {
        id: 'arrows',
        name: 'Arrow Halls',
        desc: 'Patung penjaga menembakkan panah lurus. Lewati setelah panah lewat.',
        hazardType: 'arrow',
        hazardCount: 4,
        size: 27,
        palette: {
            wallBase: '#2c2c3a',
            wallTop: '#3d3d52',
            wallBrick: '#15151a',
            floorBase: '#1f1f28',
            floorDetail: '#15151c',
            ambient: 'rgba(100, 130, 200, 0.06)'
        },
        accent: '#5dade2',
        seed: 4242
    },
    {
        id: 'spikes',
        name: 'Spike Sanctum',
        desc: 'Lantai berduri muncul dan tenggelam. Hitung iramanya.',
        hazardType: 'spike',
        hazardCount: 6,
        size: 23,
        palette: {
            wallBase: '#3a3526',
            wallTop: '#5a5040',
            wallBrick: '#1a1610',
            floorBase: '#26221a',
            floorDetail: '#181410',
            ambient: 'rgba(200, 180, 100, 0.05)'
        },
        accent: '#ecf0f1',
        seed: 9001
    },
    {
        id: 'sawmill',
        name: 'Sawmill Ruins',
        desc: 'Gergaji raksasa meluncur di atas rel. Lompat saat sudah jauh.',
        hazardType: 'saw',
        hazardCount: 3,
        size: 27,
        palette: {
            wallBase: '#2c2c2c',
            wallTop: '#454545',
            wallBrick: '#0f0f0f',
            floorBase: '#1c1c1c',
            floorDetail: '#0e0e0e',
            ambient: 'rgba(255, 200, 60, 0.06)'
        },
        accent: '#f39c12',
        seed: 2025
    },
    {
        id: 'toxic',
        name: 'Toxic Catacombs',
        desc: 'Awan beracun menyemburkan gas berkala. Tahan napas, tunggu sampai bersih.',
        hazardType: 'poison',
        hazardCount: 5,
        size: 25,
        palette: {
            wallBase: '#1f3a1f',
            wallTop: '#2f5a2f',
            wallBrick: '#0a1a0a',
            floorBase: '#1a2a1a',
            floorDetail: '#0e1a0e',
            ambient: 'rgba(80, 200, 100, 0.07)'
        },
        accent: '#2ecc71',
        seed: 7777
    }
];
