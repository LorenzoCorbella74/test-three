import {
    Mesh,
    AxesHelper,
    MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, 
    CylinderGeometry,
    Vector3, Box3,
    Group,
    BoxHelper
} from 'three';


export default function Player(game) {

    let geometry = new CylinderGeometry(0.5, 0.5, 1, 10);
    let material = new MeshBasicMaterial({ color: "hsla(212, 100%, 50%, 1)" /* , wireframe: true  */ });
    let playerGroup = new Group();
    let player = new Mesh(geometry, material);
    player.name = 'player';
    player.castShadow = true;
    player.receiveShadow = true;

    // TODO: userData = {...}
    let SPEED = 4;


    // set before positioning, rotating, scaling
    var playerBBox = new BoxHelper()
    playerBBox.setFromObject(playerGroup);


    player.position.y = 0.5 // put on the plane
    playerGroup.add(player);
     let axesHelper = new AxesHelper(1);
     player.add(axesHelper);
    game.scene.add(playerGroup);
    game.scene.add(playerBBox);

    player.velocity = new Vector3();    // TODO: si mette nell'UserData ???

    player.update = (game) => {

        let moveDistance = SPEED * game.delta; 			    // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        let rotateAngle = Math.PI / 2 * game.delta;	        // pi/2 radians (90 degrees) per second

        if (game.keyboard.pressed("W")) {
            let v = new Vector3(0, 0, -moveDistance);
            playerGroup.position.add(v);
            if (player.checkForCollision(playerBBox)) {
                playerGroup.position.sub(v);
                playerBBox.update();
            }
        }
        if (game.keyboard.pressed("S")) {
            let v = new Vector3(0, 0, moveDistance);
            playerGroup.position.add(v);
            if (player.checkForCollision(playerBBox)) {
                playerGroup.position.sub(v);
                playerBBox.update();
            }
        }
        if (game.keyboard.pressed("A")) {
            let v = new Vector3(-moveDistance, 0, 0);
            playerGroup.position.add(v);
            if (player.checkForCollision(playerBBox)) {
                playerGroup.position.sub(v);
                playerBBox.update();
            }
        }
        if (game.keyboard.pressed("D")) {
            let v = new Vector3(moveDistance, 0, 0);
            playerGroup.position.add(v);
            if (player.checkForCollision(playerBBox)) {
                playerGroup.position.sub(v);
                playerBBox.update();
            }
        }
        if (game.keyboard.pressed("P")) {
            game.pause = !game.pause;
        }
    }

    player.checkForCollision = (box) => {
        box.update();
        let futureActorPosition = new Box3(new Vector3(), new Vector3()).setFromObject(box);
        let collisionTest = new Box3(new Vector3(), new Vector3()).setFromObject(game.scene.getObjectByName('wall'));
        let collision = futureActorPosition.intersectsBox(collisionTest);
        return collision;
    }

    return { playerGroup, player };
}