import { config } from './config';

import { PerspectiveCamera } from 'three';

export default function Camera (game) {


    let cam = new PerspectiveCamera(config.FOV, window.innerWidth / window.innerHeight, config.NEAR, config.FAR);
    cam.position.z = 1.5;
    cam.position.x = 1;

    cam.switchCamera = function (type) {
        if (type == 'volo') {
            cam.position.set(0, 20, 0);
            cam.rotation.set(-1.48, 0, 0);
        } else if (type == 'zero') {
            cam.position.set(0, 1, 5);
            cam.rotation.set(0, 0, 0);
        } else if (type == 'med') {
            cam.position.set(0, 10, 10);
            cam.rotation.set(-1, 0, 0);
        }
    }

    cam.update = function () {
        if (game.keyboard.pressed("V"))
            cam.switchCamera('volo');
        if (game.keyboard.pressed("B"))
            cam.switchCamera('zero');
        if (game.keyboard.pressed("N"))
            cam.switchCamera('med');
    }

    // https://discourse.threejs.org/t/solved-smooth-chase-camera-for-an-object/3216/5
    cam.follow = function (target) {
        target.add(cam)
    }


    cam.switchCamera('zero');   // default

    return cam;
}





