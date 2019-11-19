import {
    Mesh,
    AxesHelper,
    MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial,
    CylinderGeometry, BoxGeometry,
    Vector3, Box3,
    Group,
    BoxHelper,
    Quaternion, Euler
} from 'three';

function distanceInWorldCoord (one, two) {
    let v1 = new Vector3();
    v1.setFromMatrixPosition(one.matrixWorld);
    let v2 = new Vector3();
    v2.setFromMatrixPosition(two.matrixWorld);
    return v1.distanceTo(v2);
}

function angle (v1, v2, degree = false) {
    /* let v1 = new Vector3();
    v1.setFromMatrixPosition(one.matrixWorld);
    let v2 = new Vector3();
    v2.setFromMatrixPosition(two.matrixWorld);
    console.log(v1,v2) */
    let dot = v1.dot(v2);
    // console.log(dot)
    let lengthA = v1.length();
    let lengthB = v2.length();
    // Now to find the angle
    let theta = Math.acos(dot / (lengthA * lengthB));
    return degree ? (theta * Math.PI / 180) : theta;
}

// https://stackoverflow.com/questions/52977759/three-js-how-to-find-out-xyz-rotations-between-two-vectors
function angle2 (start, finish) {

    let v1 = new Vector3();
    v1.setFromMatrixPosition(start.matrixWorld);
    let v2 = new Vector3();
    v2.setFromMatrixPosition(finish.matrixWorld);

    // Normalize vectors to make sure they have a length of 1
    v1.normalize();
    v2.normalize();

    // Create a quaternion, and apply starting, then ending vectors
    var quaternion = new Quaternion();
    quaternion.setFromUnitVectors(v1, v2);

    // Quaternion now has rotation data within it. 
    // We'll need to get it out with a Euler()
    var euler = new Euler();
    euler.setFromQuaternion(quaternion);
    return euler.toArray()[1]*180/Math.PI;
}


export default function Enemy (game) {


    let geometry = new BoxGeometry(1, 1, 1);
    let material = new MeshBasicMaterial({ color: "hsl(5, 100%, 50%)", wireframe: true });
    let enemy = new Mesh(geometry, material);
    enemy.name = 'enemy';
    enemy.castShadow = true;
    enemy.receiveShadow = true;

    // TODO: userData = {...}
    let SPEED = 4;


    // set before positioning, rotating, scaling
    // var enemyBBox = new BoxHelper()
    // enemyBBox.setFromObject(enemy);

    enemy.position.set(5, 0.5, -3)
    let axesHelper = new AxesHelper(1);
    enemy.add(axesHelper);
    game.scene.add(enemy);
    // game.scene.add(enemyBBox);

    enemy.update = (game) => {

        let rotateAngle = Math.PI / 2 * game.delta;	        // pi/2 radians (90 degrees) per second

        // enemy.rotation.y += rotateAngle;

        console.log(distanceInWorldCoord(game.player, enemy));                                  // calcola la distanza tra 2 entità -> WORKING!
        // console.log(angle(game.playerGroup.position.clone(), enemy.position.clone(), true)); // calcola l'angolo tra due entità -> NOT WORKING!
        // console.log(angle2(game.playerGroup, enemy));                                        // calcola l'angolo tra due entità -> NOT WORKING!
        // enemy.lookAt(game.playerGroup.position)                                              // guarda costantemente al player -> WORKING!

    }



    return { enemy };
}


/*

SOURCE:

VECTOR3
https://threejs.org/docs/#api/en/math/Vector3
https://dustinpfister.github.io/2018/04/15/threejs-vector3/
http://onedayitwillmake.com/blog/2011/09/getting-the-angle-between-two-3d-points/
https://stackoverflow.com/questions/27486949/three-js-change-vector-length-by-absolute-value
https://stackoverflow.com/questions/40488945/get-direction-between-two-3d-vectors-using-three-js

ROTATIONS
https://stackoverflow.com/questions/11363170/units-of-three-js-calculating-rotation-orbit-speeds
https://stackoverflow.com/questions/25199173/how-to-find-rotation-matrix-between-two-vectors-in-three-js?rq=1


*/