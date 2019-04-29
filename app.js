import "./styles.css";

import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    MeshBasicMaterial,
    Mesh,
    Color,
    AxesHelper,
    GridHelper,
    BoxBufferGeometry,
    Clock,
    HemisphereLight,
    DirectionalLight,
    DirectionalLightHelper,
    HemisphereLightHelper,
    FileLoader,
    ShaderMaterial
} from 'three';
import OrbitControls from "three-orbitcontrols";
import Stats from 'stats.js';
import hasWebgl from 'has-webgl';
import { config } from './config';
import { KeyboardState } from './keywords';

var geometry, material, mesh;


class Editor {

    constructor() {
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new Clock();
        this.container = document.querySelector("#container");
        this.stats = new Stats()
        this.keyboard = new KeyboardState(this.container);

        document.body.appendChild(this.stats.dom)
        this.init();
    }

    init () {

        this.initCamera();

        // SCENE
        this.initScene();

        // GRID
        this.initGrid();

        // CUBE
        this.initActor();

        // RENDERER
        this.initRenderer();

        // CONTROLS
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // remember these initial values on RESIZE
        this.tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2));
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // start loop
        this.loop();

    }

    initActor () {

        geometry = new BoxBufferGeometry(1, 1, 1);
        material = new MeshBasicMaterial({ color: "hsl(48, 89%, 60%)" /* , wireframe: true  */ });
        mesh = new Mesh(geometry, material);
        mesh.position.y = 0.5
        let axesHelper = new AxesHelper( 1 );
        mesh.add(axesHelper);
        this.scene.add(mesh);
    }

    initGrid () {
        this.gridHelper = new GridHelper(20, 20, 0x444444, 0x555555);
        this.gridHelper.position.y = 0;
        this.gridHelper.position.x = 0;
        this.gridHelper.position.z = 0;
        this.scene.add(this.gridHelper);
    }

    initRenderer () {
        this.renderer = new WebGLRenderer({ powerPreference: 'high-performance', antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.gammaFactor = 1.5;
        this.renderer.gammaOutput = true;
        this.renderer.physicallyCorrectLights = true;
        this.container.appendChild(this.renderer.domElement);
    }

    initScene () {
        this.scene = new Scene();
        this.scene.background = new Color("#1B2631");
        let axesHelper = new AxesHelper(3);
        this.scene.add(axesHelper);
    }

    initCamera () {
        this.camera = new PerspectiveCamera(config.FOV, window.innerWidth / window.innerHeight, config.NEAR, config.FAR);
        // this.camera.position.z = 1.5;
        // this.camera.position.x = 1;
        this.camera.position.set(2, 1, 5);
    }

    onWindowResize (event) {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        // adjust the FOV
        this.camera.fov = (360 / Math.PI) * Math.atan(this.tanFOV * (this.container.clientHeight / this.container.clientWidth));
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(this.scene.position);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.render(this.scene, this.camera);
    }

    update () {

        this.keyboard.update();

        var delta = this.clock.getDelta();              // siamo nell'ordine di 0.017480000000432483 secondi
        let dallInizio = this.clock.getElapsedTime()    // ms da quando siamo partiti (è un progressivo)
        var moveDistance = 2 * delta; 			        // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        var rotateAngle = Math.PI / 2 * delta;	        // pi/2 radians (90 degrees) per second
        this.stats.begin()


        // move forwards/backwards
        // ci si muove nel sistema di coordinate della MESH !!!!
        if (this.keyboard.pressed("W"))
            mesh.translateZ(-moveDistance);
        if (this.keyboard.pressed("S"))
            mesh.translateZ(moveDistance);
        // move left/right (strafe)
        if (this.keyboard.pressed("A"))
            mesh.translateX(-moveDistance);
        if (this.keyboard.pressed("D"))
            mesh.translateX(moveDistance);


        // this.keys.debug();
         mesh.position.y = 1 + 0.5 * Math.sin(dallInizio+rotateAngle); // 1 è la partenza 0.5 è l'ampiezza dell'oscillazione (sin è tra -1 e 1 cos tra 0 e 1)
         mesh.rotation.y += rotateAngle;
    }

    loop () {
        this.stats.begin()
        this.update()
        this.renderer.render(this.scene, this.camera);
        this.stats.end()
        requestAnimationFrame(this.loop.bind(this));
    }
}

window.onload = () => {
    if (hasWebgl) {
        const app = new Editor();
    } else {
        console.log('The browser do not support WEBGL!');
    }
}



