import {
    Mesh,
    AxesHelper,
    MeshBasicMaterial,
    BoxBufferGeometry,
    CylinderGeometry,
    Vector3,
    Group,
    BoxHelper
} from 'three';
import Camera from '../camera';

export default function Player(game) {

    // let geometry = new BoxBufferGeometry(1, 1, 1);
    let geometry = new CylinderGeometry(0.5, 0.5, 1, 10);
    let material = new MeshBasicMaterial({ color: "hsla(212, 100%, 50%, 1)" /* , wireframe: true  */ });
    let playerGroup = new Group();
    let player = new Mesh(geometry, material);
    player.name = 'player';

    // set before positioning, rotating, scaling
    var helper = new BoxHelper()
    helper.setFromObject(player);
    player.add(helper);

    player.position.y = 0.5 // put on the plane
    let axesHelper = new AxesHelper(1);

    playerGroup.add(player);
    // playerGroup.add(game.cam); //camera is following player
    player.add(axesHelper);
    game.scene.add(playerGroup);

    player.velocity = new Vector3();

    player.update = (game) => {

        let moveDistance = 2 * game.delta; 			        // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        let rotateAngle = Math.PI / 2 * game.delta;	        // pi/2 radians (90 degrees) per second

        if (game.keyboard.pressed("W")) {
            playerGroup.translateZ(-moveDistance);
        }
        if (game.keyboard.pressed("S")) {
            playerGroup.translateZ(moveDistance);
        }
        // move left/right (strafe)
        if (game.keyboard.pressed("A")) {
            playerGroup.translateX(-moveDistance);
        }
        if (game.keyboard.pressed("D")) {
            playerGroup.translateX(moveDistance);
        }
        if (game.keyboard.pressed("P")) {
            game.pause = !game.pause;
        }

    }

    return { playerGroup, player };
}