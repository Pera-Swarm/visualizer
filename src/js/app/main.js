// Global imports -
import * as THREE from 'three';

import TWEEN, { update } from '@tweenjs/tween.js';

// Components
import Renderer from './components/renderer';
import label from './components/label';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';
import Geometry from './components/geometry';
import Environment from './components/environment';

// Helpers
import MeshHelper from './helpers/meshHelper';

// Model
import Texture from './model/texture';
import Model from './model/model';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// Newly implemented classes
import MQTTClient from './managers/mqttClient';

// Config data
import Config from './../data/config';

// STLLoader
const STLLoader = require('three-stl-loader')(THREE);

// Global Variables
let camera, labelRenderer, INTERSECTED, selectedLabel;

// For click event on robots
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
    constructor(container) {
        // Set container property to container element
        this.container = container;

        // Start Three clock
        this.clock = new THREE.Clock();

        // Main scene creation
        this.scene = new THREE.Scene();
        window.scene = this.scene; // config as a global variable
        window.scene_scale = Config.scale;
        // High level reality flag
        window.selectedReality = Config.selectedReality;

        this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

        this.mqtt = new MQTTClient(this.scene);

        // Get Device Pixel Ratio first for retina
        if (window.devicePixelRatio) {
            Config.dpr = window.devicePixelRatio;
        }

        // Main renderer constructor
        this.renderer = new Renderer(this.scene, container);

        // Components instantiations
        camera = new Camera(this.renderer.threeRenderer);
        this.controls = new Controls(camera.threeCamera, container);
        this.light = new Light(this.scene);
        this.camera = camera;

        // Create and place lights in scene
        const lights = ['ambient', 'directional', 'point', 'hemi'];
        lights.forEach((light) => this.light.place(light));

        // Set up Stats if dev environment
        if (Config.isDev && Config.isShowingStats) {
            this.stats = new Stats();
            this.container.appendChild(this.stats.dom);
        }

        if (Config.isShowingLables) {
            this.labelRenderer = label();
            this.container.appendChild(this.labelRenderer.domElement);
        }

        // Set up gui
        if (Config.isDev) {
            this.gui = new DatGUI(this);
        }

        // Instantiate texture class
        this.texture = new Texture();

        // Start loading the textures and then go on to load the model after the texture Promises have resolved
        this.texture.load().then(() => {
            this.manager = new THREE.LoadingManager();

            // Create the environment ---------------------------------------------
            this.environment = new Environment();
        
            // Access globally 
            window.environment = this.environment;

            // -----------------------------------------------------------------

            if (Config.isDev) {
                // this.meshHelper = new MeshHelper(this.scene, this.model.obj);
                //
                // if (Config.mesh.enableHelper) this.meshHelper.enable();

                this.gui.load(this);
                this.gui.show();
            }
            // -----------------------------------------------------------------

            // onProgress callback
            this.manager.onProgress = (item, loaded, total) => {
                console.log(`${item}: ${loaded} ${total}`);
            };

            // All loaders done now
            this.manager.onLoad = () => {
                // alert('Loaded');
                console.log('Loading complete!');

                // Set up interaction manager with the app now that the model is finished loading
                new Interaction(
                    this.renderer.threeRenderer,
                    this.scene,
                    camera.threeCamera,
                    this.controls.threeControls
                );

                // Add dat.GUI controls if dev
                if (Config.isDev) {
                    this.meshHelper = new MeshHelper(this.scene, this.model.obj);

                    if (Config.mesh.enableHelper) this.meshHelper.enable();

                    // this.gui.load(this, this.model.obj);
                    // this.gui.show();
                }

                // Everything is now fully loaded
                Config.isLoaded = true;
                this.container.querySelector('#loading').style.display = 'none';
            };
        });

        // Start render which does not wait for model fully loaded

        this.render();
        this.container.querySelector('#loading').style.display = 'none';

        // Eventlistner for catching mouse click events
        window.addEventListener('click', this.onDocumentMouseDown, false);
        // Eventlistner for catching mouse move events
        // document.addEventListener('mousemove', this.onDocumentMouseMove);
    }

    onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.threeCamera);

        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (INTERSECTED) INTERSECTED.material.setValues({ opacity: INTERSECTED.currentOpacity });
            INTERSECTED = object;
            selectedLabel = INTERSECTED.children[0];
            INTERSECTED.currentOpacity = INTERSECTED.material.opacity;
            INTERSECTED.labelsVisibility = INTERSECTED.material.labelVisibility;
            if (selectedLabel !== undefined && selectedLabel.visible !== undefined && Config.isShowingLables) {
                selectedLabel.visible = !selectedLabel.visible;
            }
            INTERSECTED.material.selected = !INTERSECTED.material.selected;
            if (INTERSECTED.name.startsWith('Obstacle')) {
                // Obstacle selection event handling
                // if (INTERSECTED.material.selected) {
                //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                //     INTERSECTED.material.emissive.setHex(0xf95f4a);
                // } else {
                //     INTERSECTED.currentHex = INTERSECTED.material.userData.originalEmmisive;
                //     INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                // }
            } else if (INTERSECTED.name.startsWith('Robot')) {
                // Robot selection event handling
                // TODO: Consider Reality filtering too...
                if (INTERSECTED.material.selected) {
                    INTERSECTED.material.setValues({ opacity: 0.5 });
                } else {
                    INTERSECTED.material.setValues({ opacity: 1 });
                }
                if (INTERSECTED.clickEvent !== undefined) {
                    INTERSECTED.clickEvent(INTERSECTED);
                }
            }
        } else {
            if (INTERSECTED) INTERSECTED.material.setValues({ opacity: INTERSECTED.currentOpacity });
            INTERSECTED = null;
        }
    }

    onDocumentMouseMove(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.threeCamera);

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (INTERSECTED !== object) {
                if (INTERSECTED) INTERSECTED.material.setValues({ opacity: INTERSECTED.currentOpacity });
                INTERSECTED = object;
                selectedLabel = INTERSECTED.children[0];
                INTERSECTED.currentOpacity = INTERSECTED.material.opacity;
                INTERSECTED.currentColor = INTERSECTED.material.opacity;
                INTERSECTED.material.setValues({ color: 0x03dffc, opacity: 0.75 });
            }
        } else {
            if (INTERSECTED)
                INTERSECTED.material.setValues({ opacity: 1.0, color: INTERSECTED.material.userData.originalColor });
            INTERSECTED = null;
        }
    }

    render() {
        // Call render function and pass in created scene and camera
        this.renderer.render(this.scene, camera.threeCamera);

        // render labels if enabled
        if (Config.isShowingLables) {
            this.labelRenderer.domElement.hidden = false;
        } else {
            this.labelRenderer.domElement.hidden = true;
        }
        this.labelRenderer.render(this.scene, camera.threeCamera);

        // Delta time is sometimes needed for certain updates
        //const delta = this.clock.getDelta();

        // Call any vendor or module frame updates here
        TWEEN.update();
        this.controls.threeControls.update();

        camera.threeCamera.updateMatrixWorld();

        // update stats if dev environment
        if (Config.isDev && Config.isShowingStats) {
            this.stats.update();
        }

        // RAF
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    }
}
