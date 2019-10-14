import { config } from './config';

import { Object3D, Vector3, Matrix4, Quaternion, Euler } from 'three';

import TWEEN from '@tweenjs/tween.js';

import { PerspectiveCamera } from 'three';

Object3D.prototype.lookAtObject3D = function () {

    var m1 = new Matrix4();
    var position = new Vector3();
    var parentMatrix;

    return function lookAtObject3D(object) {
        object.updateWorldMatrix(true, false);
        if (this.parent) {
            this.parent.updateWorldMatrix(true, false);
            parentMatrix = this.parent.matrixWorld;
        } else {
            parentMatrix = m1.identity();
        }
        m1
            .getInverse(parentMatrix)
            .multiply(object.matrixWorld);
        position.setFromMatrixPosition(m1);
        this.lookAt(position);
    };
}();

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
        //game.controls.enabled = false;
        if (type == 'volo') {
            //newPosition = game.playerGroup.position.clone().add(new Vector3(0, 15, 0))
            //newPosition = game.controls.target.clone().add(new Vector3(0, 15, 0))
            //moveAndLookAt(cam, newPosition, game.playerGroup.position.clone(), { duration: 1000 });
            // newPosition = localToWorld(game.controls.target);
            // console.log('Local: ', game.playerGroup.position);
            // var v = new Vector3();
            // v.copy(game.playerGroup.position);
            // game.playerGroup.localToWorld(v);
            // game.playerGroup.parent.worldToLocal(v);
            // console.log('Global: ', v);
            cam.position.z = 0;
            cam.position.y = 15;
            //cam.lookAt(game.playerGroup.position);
            // cam.lookAt(game.playerGroup.position);
        } else if (type == 'player') {
            // newPosition = game.playerGroup.position.clone().add(new Vector3(0, 5, 5))
            // newPosition = game.controls.target.clone().add(new Vector3(0, 5, 5))
            // moveAndLookAt(cam, newPosition, game.playerGroup.position.clone(), { duration: 1000 });
            // newPosition.localToWorld(game.controls.target);
            cam.position.z = 5;
            cam.position.y = 5;
            // cam.lookAt(newPosition);
        }
        //game.controls.enabled = true;
        game.controls.update();
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
        moveAndLookAt(cam, target.position.clone().add(new Vector3(0, 15, 0)), target.position.clone(), { duration: 1000 });
    }

    cam.followPlayer = function () {
        cam.switchCamera('player')
    }

    // default
    // cam.position.z = 2.5;
    // cam.position.y = 5;
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





