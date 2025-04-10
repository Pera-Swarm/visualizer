import * as THREE from 'three';

import Config from '../../data/config';

export default class Environment {
    constructor() {
        console.log(`Environment: Scale: ${scene_scale}, arenaSize:${Config.arena.size}`);

        // Ground
        this.createGround(Config.arena.size, Config.arena.size);

        // Grid
        this.createGrid(Config.arena.size, Config.arena.size);
    }

    createGround(width, height) {
        let ground = window.scene.getObjectByName('env.ground');
        console.log(`Updating env.ground | ${width} x ${height}`);

        if (ground != undefined) window.scene.remove(ground);
        const geometry = new THREE.PlaneBufferGeometry(width, height);
        const material = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: false
        });
        material.userData.originalColor = new THREE.Color(0x999999);

        ground = new THREE.Mesh(geometry, material);
        ground.name = 'env.ground';
        ground.scale.set(scene_scale, scene_scale, scene_scale);
        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        window.scene.add(ground);
    }

    createGrid(width, height) {
        let grid = window.scene.getObjectByName('env.grid');
        console.log(`Updating env.grid | ${width} x ${height} | scale: ${scene_scale}`);

        if (grid != undefined) window.scene.remove(grid);

        grid = new THREE.GridHelper(width, Math.round(width / 10), 0x000000, 0x5b5b5b);
        grid.name = 'env.grid';
        grid.rotation.x = -Math.PI / 2;
        grid.scale.set(scene_scale, scene_scale, (height / width) * scene_scale);
        grid.position.set(0, 0, 0);
        grid.material.opacity = 0.35;
        grid.material.transparent = true;
        window.scene.add(grid);
    }

    update(config) {
        const { xMin, xMax, yMin, yMax } = config;
        const width = Math.abs(xMax) + Math.abs(xMin);
        const height = Math.abs(yMax) + Math.abs(yMin);

        this.createGround(width, height);
        this.createGrid(width, height);
    }
}
