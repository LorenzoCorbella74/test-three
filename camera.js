import { config } from './config';

import { Vector3, Quaternion, Euler } from 'three';

import TWEEN from '@tweenjs/tween.js';

import { PerspectiveCamera } from 'three';


// https://stackoverflow.com/questions/28091876/tween-camera-position-while-rotation-with-slerp-three-js
function moveAndLookAt(camera, dstpos, angles, options) {
    options || (options = { duration: 300 });

    var origpos = new Vector3().copy(camera.position); // original position
    var origrot = new Vector3().copy(camera.rotation); // original rotation
    // console.log('Original: ', origrot);

    camera.position.set(dstpos.x, dstpos.y, dstpos.z);
    camera.rotation.set(angles.x, angles.y, angles.z);
    var dstrot = new Euler().copy(camera.rotation);
    // console.log('Dst rotation: ', dstrot);
    camera.lookAt(camera.target);

    // reset original position and rotation
    camera.position.set(origpos.x, origpos.y, origpos.z);
    camera.rotation.set(origrot.x, origrot.y, origrot.z);

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

    cam.switchCamera = function (type) {
        if (type == 'volo') {
            moveAndLookAt(cam, new Vector3(0, 15, 0), new Vector3(-1.5, 0, 0), { duration: 1000 });
        } else if (type == 'player') {
            moveAndLookAt(cam, new Vector3(0, 5, 5), new Vector3(-.5, 0, 0), { duration: 1000 });
        }
    }

    cam.update = function () {
        if (game.keyboard.pressed("V")) {
            cam.switchCamera('volo');
        }
        if (game.keyboard.pressed("B")) {
            cam.switchCamera('player');
        }
    }

    // https://discourse.threejs.org/t/solved-smooth-chase-camera-for-an-object/3216/5
    cam.follow = function (target) {
        moveAndLookAt(cam, target.position.clone().add(new Vector3(0, 15, 0)), new Vector3(-1.5, 0, 0), { duration: 1000 });
    }

    cam.followPlayer = function () {
        cam.switchCamera('player')
    }

    // default
    setTimeout(() => {
        cam.switchCamera('volo');
    }, 10);

    return cam;
}


/*

OrbitControls breaks if camera's parent is moving (lookAt() issue
https://github.com/mrdoob/three.js/issues/15267


https://stackoverflow.com/questions/37482231/camera-position-changes-in-three-orbitcontrols-in-three-js
https://stackoverflow.com/questions/52607157/move-camera-and-update-its-orbitcontrol-in-three-js


https://github.com/mrdoob/three.js/pull/16374

*/





