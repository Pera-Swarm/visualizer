import TWEEN from '@tweenjs/tween.js';

let resolvedConfig;

// This object contains the state of the app
const config = {
    scale: 1,
    arena: {
        size: 600,
        minX: -300,
        maxX: 300,
        minY: -300,
        maxY: 300
    },
    mqtt: {
        server: localStorage.getItem('pera-swarm-server') || 'webservices.ceykod.com',
        port: parseInt(localStorage.getItem('pera-swarm-port')) || 8883,
        path: localStorage.getItem('pera-swarm-path') || '/mqtt',
        channel: localStorage.getItem('pera-swarm-channel') || 'v1'
    },
    mixedReality: {
        obstacles: 'M',
        robots: 'M'
    },
    selectedReality: 'M',
    selectedRealities: {
        real: true,
        virtual: true
    },
    hiddenOpacity: 0.3,
    isDev: true,
    isShowingStats: true,
    isShowingLables: true,
    labelsVisibility: {
        obstacles: false,
        robots: false
    },
    isShowingRobotSnapshots: true,
    isLoaded: false,
    isTweening: false,
    isRotating: false,
    isMouseMoving: false,
    isMouseOver: false,
    maxAnisotropy: 1,
    dpr: 1,
    easing: TWEEN.Easing.Quadratic.InOut,
    duration: 500,
    texture: {
        path: './assets/textures/',
        imageFiles: [{ name: 'UV', image: 'UV_Grid_Sm.jpg' }]
    },
    mesh: {
        enableHelper: false,
        wireframe: false,
        translucent: false,
        material: {
            color: 0xffffff,
            emissive: 0xffffff
        }
    },
    fog: {
        color: 0xffffff,
        near: 0.0008
    },
    camera: {
        fov: 50,
        near: 50,
        far: 1000,
        aspect: 1,
        posX: 0,
        posY: 0,
        posZ: 0
    },
    controls: {
        autoRotate: false,
        autoRotateSpeed: -1.5,
        rotateSpeed: 1.5,
        zoomSpeed: 0.8,
        minDistance: 100,
        maxDistance: 800,
        minPolarAngle: 0 /*Math.PI / 6,*/,
        maxPolarAngle: (7 / 16) * Math.PI,
        minAzimuthAngle: -Infinity,
        maxAzimuthAngle: Infinity,
        enableDamping: true,
        dampingFactor: 0.5,
        enableZoom: true,
        target: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    ambientLight: {
        enabled: true,
        color: 0x141414
    },
    directionalLight: {
        enabled: true,
        color: 0xf0f0f0,
        intensity: 0.4,
        x: -75,
        y: 280,
        z: 150
    },
    shadow: {
        enabled: true,
        helperEnabled: false,
        bias: 0,
        mapWidth: 2048,
        mapHeight: 2048,
        near: 250,
        far: 400,
        top: 100,
        right: 100,
        bottom: -100,
        left: -100
    },
    pointLight: {
        enabled: true,
        color: 0xffffff,
        intensity: 0.34,
        distance: 115,
        x: 0,
        y: 0,
        z: 0
    },
    hemiLight: {
        enabled: true,
        color: 0xc8c8c8,
        groundColor: 0xffffff,
        intensity: 0.55,
        x: 0,
        y: 0,
        z: 0
    }
};

// Check localstorage for updated config, if not use above config
const storedConfig = localStorage.getItem(document.location.href + '.config');
resolvedConfig = storedConfig !== null && storedConfig !== undefined ? JSON.parse(storedConfig) : config;

// method to presist config data with localStorage
export const saveConfig = (data) => {
    localStorage.setItem(document.location.href + '.config', JSON.stringify({ ...config, ...data }));
};

export default resolvedConfig;
