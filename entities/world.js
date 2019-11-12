import {
    MeshBasicMaterial,MeshLambertMaterial,
    Mesh,
    BoxBufferGeometry,
    GridHelper,
    PlaneGeometry, DoubleSide, TextureLoader, RepeatWrapping,  Color, MeshPhongMaterial, NearestFilter, sRGBEncoding, 
    AmbientLight, DirectionalLight,
} from 'three';

export default function createWorld (game) {

    // griglia
    // let gridHelper = new GridHelper(24, 24, 0x444444, 0x555555);
    // gridHelper.position.y = 0.05;
    // gridHelper.position.x = 0;
    // gridHelper.position.z = 0;
    // game.scene.add(gridHelper);

    //lava texture from http://opengameart.org/sites/default/files/fire.jpg
    let loader = new TextureLoader();
    loader.crossOrigin = "";
    const textureF = loader.load('http://scmapdb.wdfiles.com/local--files/wad:developer-textures/dev_128_gr_128x.jpg', textureF => {    // 'assets/img/dev_128_gr_064x.png'
        textureF.wrapS = textureF.wrapT = RepeatWrapping;
        textureF.offset.set(0, 0);
        textureF.repeat.set(12, 12);
        textureF.encoding = sRGBEncoding;
        // texture.minFilter = NearestFilter;
    });

    // FLOOR
    let plane = new Mesh(new PlaneGeometry(24, 24, 1),
        new MeshBasicMaterial({
            // color: 0x1B2831,
            map: textureF,
            side: DoubleSide
        })
    );
    plane.rotation.x = -Math.PI / 2;  // .rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
    plane.receiveShadow = true;
    game.scene.add(plane);

    // WALL
    let collisionGeometry = new BoxBufferGeometry(2, 2, 2);
    // let collisionMaterial = new MeshBasicMaterial({ color: "hsla(25, 100%, 50%, 1)" /* , wireframe: true  */ });
    const collisionMaterial = loader.load('http://scmapdb.wdfiles.com/local--files/wad:developer-textures/dev_128_or_128x.jpg', collisionMaterial => {    // 'assets/img/dev_128_gr_064x.png'
        collisionMaterial.wrapS = collisionMaterial.wrapT = RepeatWrapping;
        collisionMaterial.offset.set(0, 0);
        collisionMaterial.repeat.set(1, 1);
        collisionMaterial.encoding = sRGBEncoding;
        // texture.minFilter = NearestFilter;
    });
    let collisionTest = new Mesh(collisionGeometry, new MeshBasicMaterial({
        map: collisionMaterial,
        side: DoubleSide
    }));
    collisionTest.position.set(1, +1, -5)
    collisionTest.name = 'wall';
    collisionTest.castShadow = true;
    collisionTest.receiveShadow = true;
    game.scene.add(collisionTest);

    // LUCI
    //  subtle ambient lighting
    // let ambiColor = "#1c1c1c";
    // let ambientLight = new AmbientLight(ambiColor);
    // game.scene.add(ambientLight);
    // 
    // let pointColor = "#ede8e6";
    // let directionalLight = new DirectionalLight(pointColor);
    // directionalLight.position.set(-5, 5, 5);
    // directionalLight.castShadow = true;
    // directionalLight.target.position.set(0, 0, -10);
    // 
    // directionalLight.intensity = 1.5;
    // directionalLight.shadow.mapSize.width = 1024;
    // directionalLight.shadow.mapSize.height = 1024;
    // game.scene.add(directionalLight);
    // game.scene.add(directionalLight.target);

}