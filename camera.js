import { config } from './config';

import { PerspectiveCamera } from 'three';

export default class Camera {

    constructor(app) {
        this.app = app;
        this.cam = null;
        this.init()
    }

    init () {
        this.cam = new PerspectiveCamera(config.FOV, window.innerWidth / window.innerHeight, config.NEAR, config.FAR);
        this.cam.position.z = 1.5;
        this.cam.position.x = 1;
        // remember these initial values on RESIZE
        this.tanFOV = Math.tan(((Math.PI / 180) * this.cam.fov / 2));
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.switchCamera('zero');
    }

    switchCamera (type) {
        if (type == 'volo') {
            this.cam.position.set(0, 20, 0);
            this.cam.rotation.set(-1.48, 0, 0);
        } else if (type == 'zero') {
            this.cam.position.set(0, 1, 5);
            this.cam.rotation.set(0, 0, 0);
        } else if (type == 'med') {
            this.cam.position.set(0, 10, 10);
            this.cam.rotation.set(-1, 0, 0);
        }
    }

    onWindowResize (event) {
        this.cam.aspect = this.app.container.clientWidth / this.app.container.clientHeight;
        // adjust the FOV
        this.cam.fov = (360 / Math.PI) * Math.atan(this.tanFOV * (this.app.container.clientHeight / this.app.container.clientWidth));
        this.cam.updateProjectionMatrix();
        this.cam.lookAt(this.app.scene.position);
        this.app.renderer.setSize(this.app.container.clientWidth, this.app.container.clientHeight);
        this.app.renderer.render(this.app.scene, this.cam);
    }

}