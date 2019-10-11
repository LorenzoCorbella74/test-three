import {
    Mesh,
    AxesHelper,
    MeshBasicMaterial,
    BoxBufferGeometry,
    Vector3,
    BoxHelper
} from 'three';

export default function Player (game) {

    let geometry = new BoxBufferGeometry(1, 1, 1);
    let material = new MeshBasicMaterial({ color: "hsl(48, 89%, 60%)" /* , wireframe: true  */ });
    let player = new Mesh(geometry, material);

    // set before positioning, rotating, scaling
    var helper = new BoxHelper()
    helper.setFromObject(player);
    player.add(helper);

    player.position.y = 0.5 // put on the plane
    let axesHelper = new AxesHelper(1);
    player.add(axesHelper);
    game.scene.add(player);
    
    player.velocity = new Vector3();
    
    player.update = (game) => {

        let moveDistance = 2 * game.delta; 			        // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        let rotateAngle = Math.PI / 2 * game.delta;	        // pi/2 radians (90 degrees) per second

        if (game.keyboard.pressed("W")){
            player.translateZ(-moveDistance);
        }
        if (game.keyboard.pressed("S")){
            player.translateZ(moveDistance);
        }
        // move left/right (strafe)
        if (game.keyboard.pressed("A")){
            player.translateX(-moveDistance);
        }
        if (game.keyboard.pressed("D")){
            player.translateX(moveDistance);
        }
        if (game.keyboard.pressed("P")){
            game.pause = !game.pause;
        }

    }

    return player;
}