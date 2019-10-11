import "./styles.css";

import {
    Scene,
    WebGLRenderer,
    Color,
    AxesHelper,
    Clock,
    Vector2,
    Vector3,
    Raycaster
} from 'three';

// EXTERNAL DEPENDENCIES
import OrbitControls from "three-orbitcontrols";
import TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js';
import hasWebgl from 'has-webgl';
import * as dat from 'dat.gui';

import { KeyboardState } from './keywords';
import { calcAngleBetweenTwoPoints } from './utils/utils';

import Camera from './camera';
import Player from './entities/player';
import createWorld from './entities/world';

class Game {

    constructor() {
        this.cam = {};
        this.scene = null;
        this.renderer = null;
        this.controls = null;
        this.pause = false;
        this.clock = new Clock();

        this.mouse = new Vector2();
        this.mouseRaycaster = new Raycaster();       // for mouse
        this.mouseIntersectPoint = new Vector3();    // for mouse
        // FIXME: var mouse = new THREE.Vector2();

        this.container = document.querySelector("#container");

        this.stats = new Stats();
        this.stats.showPanel(0); //2: mb, 1: ms, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.keyboard = new KeyboardState(this.container);

        this.init();
    }

    // Esample: https://codesandbox.io/s/cannonjs-template-to0e6
    addDatGUI () {
        this.gui = new dat.GUI({autoPlace: false}); /* { name: "My GUI" }; */
        // this.gui.domElement.id = 'gui';
        var cam = this.gui.addFolder("Camera position");
        console.log('this.cam.position', this.cam.position)
        cam.add(this.cam.position, "y", 0, 25).name('Y').listen();
        cam.add(this.cam, "followPlayer").name('Follow player');
        cam.open();
        /*      
        this.gui.add(options, "stop");
        this.gui.add(options, "reset"); 
        */
        // this.gui.close();
        var GUIContainer = document.getElementById('gui');
        GUIContainer.appendChild(this.gui.domElement);
    }

    init () {

        this.initScene();      // SCENE
        this.initRenderer();   // RENDERER

        this.cam = Camera(this);
        this.player = Player(this);
        createWorld(this);

        // CONTROLS
        this.controls = new OrbitControls(this.cam, this.renderer.domElement);

        // remember these initial values on RESIZE
        this.tanFOV = Math.tan(((Math.PI / 180) * this.cam.fov / 2));
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener("mousemove", this.onMouseMove.bind(this), false);

        this.addDatGUI();

        // start gameLoop
        this.gameLoop();
    }

/*     onWindowResize() {
        this.cam.aspect = window.innerWidth / window.innerHeight;
        this.cam.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      } */


    onWindowResize (event) {
        this.cam.aspect = this.container.clientWidth / this.container.clientHeight;
        // adjust the FOV
        this.cam.fov = (360 / Math.PI) * Math.atan(this.tanFOV * (this.container.clientHeight / this.container.clientWidth));
        this.cam.updateProjectionMatrix();
        // this.cam.lookAt(this.scene.position);
        this.cam.follow(this.player)
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.render(this.scene, this.cam);
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

    onMouseMove () {
        //get mouse coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.mouseRaycaster.setFromCamera(this.mouse, this.cam);//set raycaster
        this.mouseIntersectPoint = this.mouseRaycaster.intersectObjects(this.scene.children); // find the point of intersection
        if (this.mouseIntersectPoint.length > 0) {
            var target = this.mouseIntersectPoint[0];
            // console.log(target.point);
            this.player.rotation.y = calcAngleBetweenTwoPoints(this.player.position, target.point);
        }
    }

    update () {
        this.delta = this.clock.getDelta();              // siamo nell'ordine di 0.017480000000432483 secondi
        this.dallInizio = this.clock.getElapsedTime()    // ms da quando siamo partiti (è un progressivo)

        this.player.update(this);

    }

    gameLoop () {
        requestAnimationFrame(this.gameLoop.bind(this));
        this.stats.begin();
        this.keyboard.update();
        this.cam.update();
        TWEEN.update();
        if (!this.pause) {
            this.update()
            this.renderer.render(this.scene, this.cam);
        }
        this.stats.end()
    }
}

window.onload = () => {
    if (hasWebgl) {
        const app = new Game();
    } else {
        console.log('The browser do not support WEBGL!');
    }
}
