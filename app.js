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
import { config } from './config';
import { KeyboardState } from './keywords';

var geometry, material, mesh;


class Editor {

    constructor() {
        this.camera = null;
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

        window.addEventListener("mousemove", this.onMouseMove.bind(this), false);

        // start loop
        this.loop();

    }

    initActor () {

        geometry = new BoxBufferGeometry(1, 1, 1);
        material = new MeshBasicMaterial({ color: "hsl(48, 89%, 60%)" /* , wireframe: true  */ });
        this.actor = new Mesh(geometry, material);
        this.actor.position.y = 0.51
        let axesHelper = new AxesHelper(1);
        this.actor.add(axesHelper);
        this.scene.add(this.actor);

        this.actor.velocity = new Vector3();

        var helper = new BoxHelper(this.actor, 0xff0000);
        this.actor.limit = 0.5 - helper.geometry.boundingSphere.radius;

        this.actor.add(helper);
        console.log(this.actor);

        for (let a = 0; a < 5; a++) {
            var sloped = new BoxBufferGeometry(2,2, 0.2*(1+a));
            var SlopedMaterial = new MeshBasicMaterial({ color: 0x555555 });
            var slopedMesh = new Mesh(sloped, SlopedMaterial);
            slopedMesh.position.x = -2;
            slopedMesh.position.z = 2*(1+a);
            slopedMesh.position.y = 0.1;
            slopedMesh.rotation.x = Math.PI / 2; 

            /* wireframe */
            var geo = new EdgesGeometry( slopedMesh.geometry ); // or WireframeGeometry  
            var mat = new LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
            var wireframe = new LineSegments( geo, mat );
            slopedMesh.add( wireframe );
            this.scene.add(slopedMesh);
            
        }
    }

    initGrid () {
        this.gridHelper = new GridHelper(24, 24, 0x444444, 0x555555);
        this.gridHelper.position.y = 0.01;
        this.gridHelper.position.x = 0;
        this.gridHelper.position.z = 0;
        this.scene.add(this.gridHelper);
        var geometry = new PlaneGeometry(24, 24, 1);
        var material = new MeshBasicMaterial({ color: 0xFFFFFF, side: DoubleSide });
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

    initCamera () {
        this.camera = new PerspectiveCamera(config.FOV, window.innerWidth / window.innerHeight, config.NEAR, config.FAR);
        // this.camera.position.z = 1.5;
        // this.camera.position.x = 1;
        this.switchCamera('zero');
    }

    // in radianti on a 2D plane (x,z)
    calcAngleBetweenTwoPoints(p1,p2){
        return Math.atan2(p2.x - p1.x, p2.z - p1.z)/* * 180 / Math.PI */;
    }

    onMouseMove () {
        //get mouse coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);//set raycaster
        this.intersectPoint = this.raycaster.intersectObjects(this.scene.children); // find the point of intersection
        if (this.intersectPoint.length > 0) {
            var target = this.intersectPoint[0];
            // console.log(target.point);
            // ddthis.actor.rotation.y = this.calcAngleBetweenTwoPoints(this.actor.position, target.point);
        }
    }

    switchCamera (type) {
        if (type == 'volo') {
            this.camera.position.set(0, 20, 0);
            this.camera.rotation.set(-1.48, 0, 0);
        } else if (type=='zero'){
            this.camera.position.set(0, 1, 5);
            this.camera.rotation.set(0, 0, 0);
        } else if (type=='med'){
            this.camera.position.set(0, 10, 10);
            this.camera.rotation.set(-1, 0, 0);
        }
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

        var delta = this.clock.getDelta();              // siamo nell'ordine di 0.017480000000432483 secondi
        let dallInizio = this.clock.getElapsedTime()    // ms da quando siamo partiti (è un progressivo)
        var moveDistance = 2 * delta; 			        // 2 units per second (è funzione della dimensione dell'oggetto che si muove)
        var rotateAngle = Math.PI / 2 * delta;	        // pi/2 radians (90 degrees) per second
        this.stats.begin();

        // console.log(this.actor.position, this.actor.matrixWorld)
        // var vector = this.camera.position.clone();
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
            this.switchCamera('volo');
        if (this.keyboard.pressed("B"))
            this.switchCamera('zero');
        if (this.keyboard.pressed("N"))
            this.switchCamera('med');

        // this.keys.debug();
        // this.actor.position.y = 1 + 0.5 * Math.sin(dallInizio + rotateAngle); // 1 è la partenza 0.5 è l'ampiezza dell'oscillazione (sin è tra -1 e 1 cos tra 0 e 1)
        // this.actor.rotation.y += rotateAngle;

        /* 
            Il soggetto in movimento sale e scende allineando la .position.y al piano su cui tocca il raggio. Problemi:
            1) il raggio è sparato dal centro dell'oggetto pertanto finchè non si arriva a tale punto non si adeguerà al piano
            2) il salto è netto, a gradini da un piano all'altro
            3) per piani superiori al punto da cui è sparato  il raggio non si aggiorna il 
        */
        // var raycaster = new Raycaster();
        // raycaster.set(this.actor.position, new Vector3(0, -1, 0));
        // let floors= this.scene.children.filter(e=>e instanceof Mesh);
        // let max = 0;
        // for (let i = 0; i < floors.length; i++) {
        //     const floor = floors[i];
        //     var intersectFloor = raycaster.intersectObject(floor);
        //     let comp =intersectFloor.length>0? intersectFloor[0].point.y + 0.51 : 0.51; // 0.51  è la distanza tra il centro e la superficie di appoggio
        //     if(comp>max){
        //         max=comp;
        //     }
        // }
        // this.actor.position.y = max; 

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

    loop () {
        this.stats.begin();
        this.keyboard.update();

        if (!this.pause) {
            this.update()
            this.renderer.render(this.scene, this.camera);
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



