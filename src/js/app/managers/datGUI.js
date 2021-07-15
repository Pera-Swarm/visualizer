import Config, { saveConfig } from '../../data/config';

// COMMENT(NuwanJ)
// Store the last state of the toggles in the window.localStorage
// Refer: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// Refer: https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+useLocalStorage

// Manages all dat.GUI interactions
export default class DatGUI {
    constructor(main) {
        this.gui = new dat.GUI();

        this.gui.useLocalStorage = true;

        this.camera = main.camera.threeCamera;
        this.controls = main.controls.threeControls;
        this.light = main.light;
        this.scene = main.scene;

        this.model = null;
        this.meshHelper = null;
    }

    load(main, mesh) {
        // Add folders
        this.gui
            .add(Config, 'isShowingRobotSnapshots')
            .name('Robot Snapshots')
            .onChange((value) => {
                Config.isShowingRobotSnapshots = value;
                saveConfig(Config);
            });

        /* Labels Folder */
        const labelsFolder = this.gui.addFolder('Labels');
        labelsFolder
            .add(Config, 'isShowingLables')
            .name('All Labels')
            .onChange((value) => {
                Config.isShowingLables = value;
                Config.labelsVisibility = {
                    obstacles: value,
                    robots: value
                };
                saveConfig(Config);
            });

        labelsFolder
            .add(Config.labelsVisibility, 'obstacles')
            .name('Obstacle Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Obstacle', value);
            });
        labelsFolder
            .add(Config.labelsVisibility, 'robots')
            .name('Robot Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Robot', value);
            });

        /* Reality Folder */
        const realityFolder = this.gui.addFolder('Reality');

        realityFolder
            .add(Config.selectedRealities, 'real')
            .name('Physical Reality')
            .listen()
            .onChange((value) => {
                this.toggleReality('real', 'R');
            });
        realityFolder
            .add(Config.selectedRealities, 'virtual')
            .name('Virtual Reality')
            .listen()
            .onChange((value) => {
                this.toggleReality('virtual', 'V');
            });

        // Other
        const otherFolder = this.gui.addFolder('Other');
        otherFolder
            .add(Config.controls, 'autoRotate')
            .name('Auto Rotate')
            .listen()
            .onChange((value) => {
                // alert('Toggle AutoRotate');
                Config.controls.autoRotate = value;
                saveConfig(Config);
                location.reload();
            });
        otherFolder
            .add(Config.controls, 'autoRotateSpeed')
            .min(-5)
            .max(5)
            .name('Auto Rotate Speed')
            .listen()
            .onChange((value) => {
                Config.controls.autoRotateSpeed = value;
                saveConfig(Config);
                // location.reload();
            });
        /* Global */
        // this.gui.open();
        this.gui.close();

        // this.model = main.model;
        // this.meshHelper = main.meshHelper;
    }

    toggleLabels(objects, type, value) {
        saveConfig(Config);
        if (Array.isArray(objects) && type !== undefined && type !== '') {
            for (var variable of objects) {
                if (variable.name.startsWith(type)) {
                    variable.children[0].visible = value;
                }
            }
        }
    }

    toggleReality(reality, selected) {
        // by default visualizer will intercept all the communication coming to the channel regardless of the reality.
        // this control panel will only toggle the 'visibility' of objects in the selected realities.
        const objects = scene.children;
        saveConfig(Config);
        Object.entries(objects).forEach((obj) => {
            const name = obj[1]['name'];
            const reality = obj[1]['reality'];

            if (reality !== undefined && reality === 'R') {
                // obj[1].transparent = Config.selectedRealities.real;
                obj[1].material.opacity = Config.selectedRealities.real ? 1.0 : Config.hiddenOpacity;
            } else if (reality !== undefined && reality === 'V') {
                // obj[1].transparent = Config.selectedRealities.virtual;
                obj[1].material.opacity = Config.selectedRealities.virtual ? 1.0 : Config.hiddenOpacity;
            }
        });
    }

    show() {
        this.gui.show();
    }

    unload() {
        this.gui.destroy();
        this.gui = new dat.GUI();
    }
}
