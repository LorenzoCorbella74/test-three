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

var geometry, material, mesh;


class Editor {

    constructor() {
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null;
        this.container = document.querySelector("#container");
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)
        this.init();
    }

    init () {

        this.initCamera();

        // SCENE
        this.initScene();

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
        this.gridHelper = new GridHelper(20, 20, 0x444444, 0x555555);
        this.gridHelper.position.y = 0;
        this.gridHelper.position.x = 0;
        this.gridHelper.position.z = 0;
        this.scene.add(this.gridHelper);

        geometry = new BoxBufferGeometry(0.2, 0.2, 0.2);
        material = new MeshBasicMaterial({ color: "hsl(48, 89%, 60%)" /* , wireframe: true  */});
        mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
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
        this.stats.begin()
        let timer = 0.001 * Date.now();
        mesh.position.y = 0.5 + 0.5 * Math.sin(timer);
        mesh.rotation.y += 0.01;
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



