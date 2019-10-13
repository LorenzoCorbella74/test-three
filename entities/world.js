import {
    MeshBasicMaterial,
    Mesh,
    GridHelper,
    PlaneGeometry, DoubleSide
} from 'three';


export default function createWorld(game) {

    let gridHelper = new GridHelper(24, 24, 0x444444, 0x555555);
    gridHelper.position.y = 0.05;
    gridHelper.position.x = 0;
    gridHelper.position.z = 0;
    game.scene.add(gridHelper);

    let geometry = new PlaneGeometry(24, 24, 1);
    let material = new MeshBasicMaterial({ color: 0x1B2831, side: DoubleSide });
    let plane = new Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;  // .rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
    game.scene.add(plane);
}