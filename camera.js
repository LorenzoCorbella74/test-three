import { config } from './config';

import { Vector3, Quaternion, Euler } from 'three';

import TWEEN from '@tweenjs/tween.js';

import { PerspectiveCamera } from 'three';

// https://stackoverflow.com/questions/28091876/tween-camera-position-while-rotation-with-slerp-three-js
function moveAndLookAt(camera, dstpos, dstlookat, options) {
    options || (options = { duration: 300 });

    var origpos = new Vector3().copy(camera.position); // original position
    var origrot = new Euler().copy(camera.rotation); // original rotation

    camera.position.set(dstpos.x, dstpos.y, dstpos.z);
    camera.lookAt(dstlookat);
    var dstrot = new Euler().copy(camera.rotation)

    // reset original position and rotation
    camera.position.set(origpos.x, origpos.y, origpos.z);
    camera.rotation.set(origrot.x, origrot.y, origrot.z);

    //
    // Tweening
    //

    // position
    new TWEEN.Tween(camera.position).to({
        x: dstpos.x,
        y: dstpos.y,
        z: dstpos.z
    }, options.duration).start();

    // rotation (using slerp)
    var qa = qa = new Quaternion().copy(camera.quaternion); // src quaternion
    var qb = new Quaternion().setFromEuler(dstrot); // dst quaternion
    var qm = new Quaternion();
    // camera.quaternion = qm;
    var o = { t: 0 };
    new TWEEN.Tween(o).to({ t: 1 }, options.duration)
        .onUpdate(function () {
            Quaternion.slerp(qa, qb, qm, o.t);
            camera.quaternion.set(qm.x, qm.y, qm.z, qm.w);
        })
        .start();

}

export default function Camera(game) {

    let cam = new PerspectiveCamera(config.FOV, window.innerWidth / window.innerHeight, config.NEAR, config.FAR);
    let newPosition = new Vector3(0, 0, 0);

    cam.switchCamera = function (type) {
        if (type == 'volo') {
            // cam.position.set(0, 20, 0);
            // cam.rotation.set(-1.48, 0, 0);
            newPosition = game.playerGroup.position.clone().add(new Vector3(0, 15, 0))
            moveAndLookAt(cam, newPosition, game.playerGroup.position, { duration: 1000 });
        } else if (type == 'origin') {
            newPosition = new Vector3(0, 1, 5)
            moveAndLookAt(cam, newPosition, game.playerGroup.position, { duration: 1000 });
        } else if (type == 'player') {
            newPosition = game.playerGroup.position.clone().add(new Vector3(0, 0, 0))
            moveAndLookAt(cam, newPosition, game.playerGroup.position, { duration: 1000 });
        }
    }

    cam.update = function () {


        // cam.position.copy(newPosition);
        // cam.lookAt(game.playerGroup);

        if (game.keyboard.pressed("V"))
            cam.switchCamera('volo');
        if (game.keyboard.pressed("B"))
            cam.switchCamera('origin');
        if (game.keyboard.pressed("M"))
            cam.switchCamera('player');
    }

    // https://discourse.threejs.org/t/solved-smooth-chase-camera-for-an-object/3216/5
    cam.follow = function (target) {
        // target.add(cam)
        moveAndLookAt(cam, new Vector3(0, 10, 10), target.position.clone(), { duration: 1000 });
    }

    cam.followPlayer = function () {
        // game.playerGroup.add(cam)
        cam.switchCamera('player')
    }

    // default
    // cam.position.z = 1.5;
    // cam.position.x = 1;
    setTimeout(() => {
        cam.switchCamera('volo');
    }, 10);

    return cam;
}





