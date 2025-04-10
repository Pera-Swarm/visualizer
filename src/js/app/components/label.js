import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    CSS2DRenderer,
    CSS2DObject
} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Config from '../../data/config';

export default function () {
    const renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.isShowingLables = Config.isShowingLables;
    renderer.isShowingObstacleLables = Config.labelsVisibility.obstacles;
    renderer.isShowingRobotLables = Config.labelsVisibility.robots;
    renderer.updateSize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    document.addEventListener('DOMContentLoaded', () => renderer.updateSize(), false);
    window.addEventListener('resize', () => renderer.updateSize(), false);
    return renderer;
}

export const addLabel = (prefix, object, mesh, visibility) => {
    if (mesh !== undefined) {
        const element = document.createElement('div');
        element.className = 'label';

        // TODO: use names, insted of IDs
        element.textContent = object.name + ' [' + mesh.reality + ']';

        element.style.marginTop = '-1.2em';
        const elementLabel = new CSS2DObject(element);
        elementLabel.name = `Label[${object.id}]`;
        elementLabel.position.set(0, 1, 0);
        elementLabel.visible = visibility;
        mesh.add(elementLabel);
        mesh.removeLabel = () => {
            mesh.remove(elementLabel);
        };
    }
};

export const removeLabel = (mesh) => {
    if (mesh !== undefined && mesh.removeLabel !== undefined) {
        mesh.removeLabel();
    }
};
