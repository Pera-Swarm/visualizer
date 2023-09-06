import * as THREE from 'three';

import Config from '../../data/config';
import { addLabel, removeLabel } from './label';

const OBSTACLE_PREFIX = 'Obstacle_';

export default class Obstacle {
    constructor(scene, callback) {
        this.scene = scene;
        console.log('Obstacle Reality:', Config.mixedReality.obstacles);

        if (callback !== undefined) {
            callback();
        }
    }

    // Create a given list of obstacles
    createList(obstacles) {
        Object.entries(obstacles).forEach((obs) => {
            if (obs !== undefined) {
                //console.log(obs[1]);
                this.create(obs[1]);
            }
        });
    }

    // Create a obstacle
    create(obstacle) {
        const geometry = this.createGeometry(obstacle.geometry);
        const material = this.createMaterial(obstacle.material);
        material.userData.originalColor = new THREE.Color(0x666666);
        material.userData.labelVisibility =
            Config.isShowingLables && Config.labelsVisibility.obstacles;
        material.userData.originalEmmisive = material.emissive.getHex();
        material.selected = false;
        material.transparent = true;
        const id = obstacle.id || 1000 + Math.floor(900 * Math.random());

        const reality = obstacle.reality == undefined ? 'V' : obstacle.reality;
        const mesh = new THREE.Mesh(geometry, material);

        // TODO: add the name defined in env.config.json as discussed on 2021-02-18
        //      Need some obstacle protocol revision + simulator updates
        const name_temp = 'Obs_' + id.toString().substring(0, 8) + '...';

        mesh.name = OBSTACLE_PREFIX + id;
        mesh.reality = reality; // set reality flag

        if (mesh.reality === 'V') {
            // material.visible = Config.selectedRealities.virtual;
            material.opacity = Config.selectedRealities.virtual
                ? 1.0
                : Config.hiddenOpacity;
        } else if (mesh.reality === 'R') {
            // material.visible = Config.selectedRealities.real;
            material.opacity = Config.selectedRealities.real ? 1.0 : Config.hiddenOpacity;
        }

        // Remove if object is already defined
        this.deleteIfExists(id);

        // Add the mesh object to arena
        this.scene.add(mesh);

        // update the position of the object
        if (obstacle.position !== undefined) {
            const { x, y } = obstacle.position;
            const z = this.calculateZ(obstacle);

            mesh.scale.set(scene_scale, scene_scale, scene_scale);
            mesh.position.set(scene_scale * x, scene_scale * y, scene_scale * z);
        }

        // Rotate the object, after translate degrees into radians
        if (obstacle.rotation !== undefined) {
            const { x, y, z } = obstacle.rotation;
            const radX = ((90 + x) / 360) * 2 * Math.PI; // transformation due to coordinate system
            const radY = (y / 360) * 2 * Math.PI;
            const radZ = (z / 360) * 2 * Math.PI;

            mesh.rotation.set(radX, radY, radZ);
        }

        // Show shadows of the object if enabled
        if (Config.shadow.enabled) mesh.receiveShadow = true;

        // Add labels to every obstacle, immediately displayed if enabled
        // addLabel(
        //     OBSTACLE_PREFIX,
        //     { id: obstacle.id, name: name_temp },
        //     mesh,
        //     Config.labelsVisibility.obstacles
        // );

        console.log('Created>', mesh.name);
    }

    createGeometry(g) {
        if (g.type == undefined) throw new TypeError('type unspecified');

        if (g.type == 'BoxGeometry') {
            return this.createBoxGeometry(g.width, g.height, g.depth);
        } else if (g.type == 'CylinderGeometry') {
            return this.createCylinderGeometry(g.radiusTop, g.radiusBottom, g.height);
        } else if (g.type == 'SphereGeometry') {
            return this.createSphereGeometry(g.radius);
        }
        throw new TypeError('unsupported geometry type');
    }

    createBoxGeometry(width, height, depth) {
        if (width == undefined) throw new TypeError('width unspecified');
        if (height == undefined) throw new TypeError('height unspecified');
        if (depth == undefined) throw new TypeError('depth unspecified');

        // https://threejs.org/docs/#api/en/geometries/BoxGeometry
        return new THREE.BoxGeometry(width, height, depth);
    }

    createCylinderGeometry(radiusTop, radiusBottom, height) {
        if (radiusTop == undefined) throw new TypeError('radiusTop unspecified');
        if (radiusBottom == undefined) throw new TypeError('radiusBottom unspecified');
        if (height == undefined) throw new TypeError('height unspecified');

        // https://threejs.org/docs/#api/en/geometries/CylinderGeometry
        const heightSegments = heightSegments || 2;
        const radialSegments = radialSegments || 16;

        return new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            radialSegments,
            heightSegments
        );
    }

    createSphereGeometry(radius) {
        if (radius == undefined) throw new TypeError('radius unspecified');

        // https://threejs.org/docs/#api/en/geometries/SphereGeometry
        const widthSegments = widthSegments || 16;
        const heightSegments = heightSegments || 16;
        return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    }

    createMaterial(m) {
        let material;
        if (m.type == 'MeshBasicMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
            return new THREE.MeshBasicMaterial(m.properties);
        } else if (m.type == 'MeshNormalMaterial') {
            // https://threejs.org/docs/api/en/materials/MeshNormalMaterial.html
            return new THREE.MeshNormalMaterial(m.properties);
        } else if (m.type == 'MeshPhongMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshPhongMaterial
            return new THREE.MeshPhongMaterial(m.properties);
        } else if (m.type == 'MeshPhysicalMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
            return new THREE.MeshPhysicalMaterial(m.properties);
        } else if (m.type == 'MeshStandardMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
            return new THREE.MeshStandardMaterial(m.properties);
        }
        // Default material type
        return new THREE.MeshStandardMaterial(m.properties);
    }

    calculateZ(obstacle) {
        // If z is undefined, place the object in top of the arena
        if (obstacle.position.z == undefined) {
            if (obstacle.geometry.height !== undefined) {
                // Box and Cylinder objects
                return obstacle.geometry.height / 2;
            } else if (obstacle.geometry.radius !== undefined) {
                // Sphere objects
                return obstacle.geometry.radius;
            }
            return 0;
        }
        return obstacle.position.z;
    }

    deleteIfExists(id) {
        // Delete obstacle if it already exists
        const name = OBSTACLE_PREFIX + id;
        const obstacle = this.scene.getObjectByName(name);
        if (obstacle !== undefined) {
            this.scene.remove(obstacle);
            console.log('Deleted>', name);
        }
    }

    deleteAll() {
        // Delete all obstacles
        const objects = this.scene.children;
        Object.entries(objects).forEach((obj) => {
            const name = obj[1]['name'];
            if (name.startsWith(OBSTACLE_PREFIX)) {
                console.log('Deleted>', name);
                removeLabel(obj[1]);
                this.scene.remove(obj[1]);
            }
        });
    }
}
