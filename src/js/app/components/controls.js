import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Config from '../../data/config';

// Controls based on orbit controls
export default class Controls {
    constructor(camera, container) {
        this.threeControls = new OrbitControls(camera, container);

        this.init();
    }

    init() {
        this.threeControls.target.set(
            Config.controls.target.x,
            Config.controls.target.y,
            Config.controls.target.z
        );
        this.threeControls.autoRotate = Config.controls.autoRotate;
        this.threeControls.autoRotateSpeed = Config.controls.autoRotateSpeed;
        this.threeControls.rotateSpeed = Config.controls.rotateSpeed;
        this.threeControls.zoomSpeed = Config.controls.zoomSpeed;
        this.threeControls.minDistance = Config.controls.minDistance;
        this.threeControls.maxDistance = Config.controls.maxDistance;
        this.threeControls.minPolarAngle = Config.controls.minPolarAngle;
        this.threeControls.maxPolarAngle = Config.controls.maxPolarAngle;
        this.threeControls.enableDamping = Config.controls.enableDamping;
        this.threeControls.enableZoom = Config.controls.enableZoom;
        this.threeControls.dampingFactor = Config.controls.dampingFactor;

        this.threeControls.enableRotate = true;

        // Avoid null situations
        if (Config.controls.minAzimuthAngle == null) {
            this.threeControls.minAzimuthAngle = -Infinity;
        } else {
            this.threeControls.minAzimuthAngle = Config.controls.minAzimuthAngle;
        }

        // Avoid null situations
        if (Config.controls.maxAzimuthAngle == null) {
            this.threeControls.maxAzimuthAngle = Infinity;
        } else {
            this.threeControls.maxAzimuthAngle = Config.controls.maxAzimuthAngle;
        }

        /*this.threeControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        }*/
    }
}
