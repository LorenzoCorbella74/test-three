import "./styles.css";

import {
    Scene,
    WebGLRenderer,
    MeshBasicMaterial,
    Mesh,
    Color,
    AxesHelper,
    GridHelper,
    BoxBufferGeometry,
    Clock,
    Vector2,
    Vector3,
    Raycaster,
    PlaneGeometry, DoubleSide, 
    BoxHelper,
    Line,Geometrybv,
    EdgesGeometry, LineBasicMaterial, LineSegments
} from 'three';
import OrbitControls from "three-orbitcontrols";
import Stats from 'stats.js';
import hasWebgl from 'has-webgl';

import { KeyboardState } from './keywords';
import {calcAngleBetweenTwoPoints} from './utils/utils';
import Camera from './camera';


class Editor {

    constructor() {
        this.camera = {};
        this.scene = null;
        this.renderer = null;
        this.controls = null;
        this.pause = false;
        this.clock = new Clock();
        this.mouse = new Vector2();
        this.raycaster = new Raycaster();
        this.intersectPoint = new Vector3();
        // this.collidableObjects = [];
        this.container = document.querySelector("#container");
        this.stats = new Stats();
        this.camera = new Camera(this);
        this.keyboard = new KeyboardState(this.container);

        document.body.appendChild(this.stats.dom)
        this.init();
    }

    init () {

        this.initScene();      // SCENE
        this.initGrid();       // GRID
        this.initActor();      // CUBE
        this.initRenderer();   // RENDERER

        // CONTROLS
        this.controls = new OrbitControls(this.camera.cam, this.renderer.domElement);

        window.addEventListener("mousemove", this.onMouseMove.bind(this), false);

        // start gameLoop
        this.gameLoop();
    }

    initActor () {

        let geometry = new BoxBufferGeometry(1, 1, 1);
        let material = new MeshBasicMaterial({ color: "hsl(48, 89%, 60%)" /* , wireframe: true  */ });
        this.actor = new Mesh(geometry, material);
        // before positioning, rotating, scaling
        var helper = new BoxHelper()
        helper.setFromObject(this.actor);

        this.actor.position.y = 0.01
        let axesHelper = new AxesHelper(1);
        this.actor.add(axesHelper);
        this.scene.add(this.actor);

        this.actor.velocity = new Vector3();

        // this.actor.limit = 0.5 - helper.geometry.boundingSphere.radius;

        this.actor.add(helper);
        console.log(this.actor);
    }

    initGrid () {
        this.gridHelper = new GridHelper(24, 24, 0x444444, 0x555555);
        this.gridHelper.position.y = 0;
        this.gridHelper.position.x = 0;
        this.gridHelper.position.z = 0;
        this.scene.add(this.gridHelper);
        var geometry = new PlaneGeometry(24, 24, 1);
        var material = new MeshBasicMaterial({ color: 0x1B2831, side: DoubleSide });
        this.plane = new Mesh(geometry, material);
        this.plane.rotation.x = Math.PI / 2;  // .rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
        this.scene.add(this.plane);
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

        this.raycaster.setFromCamera(this.mouse, this.camera.cam);//set raycaster
        this.intersectPoint = this.raycaster.intersectObjects(this.scene.children); // find the point of intersection
        if (this.intersectPoint.length > 0) {
            var target = this.intersectPoint[0];
            // console.log(target.point);
            this.actor.rotation.y = calcAngleBetweenTwoPoints(this.actor.position, target.point);
        }
    }


    update () {

        var delta = this.clock.getDelta();              // siamo nell'ordine di 0.017480000000432483 secondi
        let dallInizio = this.clock.getElapsedTime()    // ms da quando siamo partiti (è un progressivo)
        var moveDistance = 2 * delta; 			        // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        var rotateAngle = Math.PI / 2 * delta;	        // pi/2 radians (90 degrees) per second
        this.stats.begin();

        // console.log(this.actor.position, this.actor.matrixWorld)
        // var vector = this.camera.cam.position.clone();
        // this.actor.applyMatrix( this.actor.matrixWorld );
        // console.log(this.actor)

        // move forwards/backwards
        // ci si muove nel sistema di coordinate della MESH !!!!
        if (this.keyboard.pressed("W"))
            this.actor.translateZ(-moveDistance);
        if (this.keyboard.pressed("S"))
            this.actor.translateZ(moveDistance);
        // move left/right (strafe)
        if (this.keyboard.pressed("A"))
            this.actor.translateX(-moveDistance);
        if (this.keyboard.pressed("D"))
            this.actor.translateX(moveDistance);
        if (this.keyboard.pressed("V"))
            this.camera.switchCamera('volo');
        if (this.keyboard.pressed("B"))
            this.camera.switchCamera('zero');
        if (this.keyboard.pressed("N"))
            this.camera.switchCamera('med');

        let distance = 0.5;
        let deltaS = 0.1;

        var raycaster = new Raycaster();
        raycaster.set(this.actor.position, new Vector3(0, -1, 0));
        
        let floors = this.scene.children.filter(e => e instanceof Mesh);
        let max = 0;
        for (let i = 0; i < floors.length; i++) {
            const floor = floors[i];
            var intersectFloor = raycaster.intersectObject(floor);
            // se c'è almeno un piano
            if (intersectFloor.length > 0) {
                if (distance > intersectFloor[0].distance) {
                    this.actor.position.y += (distance - intersectFloor[0].distance); // sale lo scalino...
                }
                //gravity and prevent falling through floor
                if (distance == intersectFloor[0].distance && this.actor.velocity.y <= 0) {
                    this.actor.velocity.y = 0;
                } else if (distance < intersectFloor[0].distance && this.actor.velocity.y === 0) {
                    this.actor.velocity.y -= deltaS;
                    console.log(this.actor.velocity.y)
                }
            }
        }
         this.actor.translateY(this.actor.velocity.y);
    }

    gameLoop () {
        this.stats.begin();
        this.keyboard.update();

        if (!this.pause) {
            this.update()
            this.renderer.render(this.scene, this.camera.cam);
        }
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



