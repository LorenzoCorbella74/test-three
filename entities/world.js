import {
    MeshBasicMaterial,
    Mesh,
    BoxBufferGeometry,
    GridHelper,
    PlaneGeometry, DoubleSide, TextureLoader, RepeatWrapping, DirectionalLight, Color, MeshPhongMaterial, NearestFilter, sRGBEncoding
} from 'three';



export default function createWorld (game) {

    // griglia
    let gridHelper = new GridHelper(24, 24, 0x444444, 0x555555);
    gridHelper.position.y = 0.05;
    gridHelper.position.x = 0;
    gridHelper.position.z = 0;
    game.scene.add(gridHelper);

    //lava texture from http://opengameart.org/sites/default/files/fire.jpg
    let loader = new TextureLoader();
    loader.crossOrigin = "";
    let texture = loader.load('assets/img/dev_128_gr_064x.png',  (texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat(24, 24);
        texture.encoding = sRGBEncoding
        texture.minFilter = NearestFilter;
    });

    // Piano
    // let geometry = new PlaneGeometry(24, 24, 1);
    // let material = new MeshBasicMaterial({ color: 0x1B2831, side: DoubleSide });
    // let plane = new Mesh(geometry, material);
    let plane = new Mesh(new PlaneGeometry(24, 24, 1),
        //new MeshPhongMaterial({
        //    emissive: 0xffcb00,
        //    specular: 0xffcb00,
        //    shininess: 10,
        //    map: texture,
        //    side: DoubleSide
        //})
        new MeshBasicMaterial({
            // emissive: 0xffcb00,
            // specular: 0xffcb00,
            // shininess: 10,
            map: texture,
            side: DoubleSide
        })
    );
    plane.rotation.x = Math.PI / 2;  // .rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
    game.scene.add(plane);



    // muro
    let collisionGeometry = new BoxBufferGeometry(10, 2.5, 1);
    let collisionMaterial = new MeshBasicMaterial({ color: "hsla(25, 100%, 50%, 1)" /* , wireframe: true  */ });
    let collisionTest = new Mesh(collisionGeometry, collisionMaterial);
    collisionTest.position.set(0, 0, -5)
    collisionTest.name = 'wall';
    game.scene.add(collisionTest);

    // LUCI
    let light = new DirectionalLight(new Color("#ffee00")); // giallo
    light.position.set(0, 50, 0);
    game.scene.add(light);
}