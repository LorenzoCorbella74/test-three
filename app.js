import "./styles.css";

import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Mesh,
    MeshBasicMaterial,
    Color,
    PlaneGeometry, CubeGeometry,CylinderGeometry,ConeGeometry, BoxBufferGeometry,CircleGeometry, SphereGeometry,
    AxesHelper,
    RepeatWrapping,
    GridHelper,
    PointLight,
    ImageUtils,
    Clock,
    Raycaster,
    TextureLoader,
    HemisphereLight,
    DirectionalLight,
    DirectionalLightHelper,
    HemisphereLightHelper,
    FileLoader,
    ShaderMaterial, Vector3, Object3D, Math as Mate, BackSide, LineBasicMaterial, Line, Geometry
} from 'three';
// import OrbitControls from "three-orbitcontrols";
import Stats from 'stats.js';
import hasWebgl from 'has-webgl';
import { config } from './config';
import { KeyboardState } from './keywords';


class Editor {

    constructor() {
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new Clock();
        this.container = document.querySelector("#container");
        this.stats = new Stats();
        this.keyboard = new KeyboardState(this.container);
        document.body.appendChild(this.stats.domElement)

        this.init();
    }

    init() {
        this.initScene();       // SCENE
        this.initRenderer();    // RENDERER
        this.loop();            // GAME LOOP

        // EVENTS
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        // when the mouse moves, call the given function
        document.addEventListener('mousemove', this.mouseMove.bind(this), false);
        document.addEventListener('mousedown', this.mouseClick.bind(this), false);
    }

    initRenderer() {
        this.renderer = new WebGLRenderer({ powerPreference: 'high-performance', antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.gammaFactor = 1.5;
        this.renderer.gammaOutput = true;
        this.renderer.physicallyCorrectLights = true;
        this.container.appendChild(this.renderer.domElement);
    }

    initScene() {

        this.scene = new Scene();

        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;

        let MAP_WIDTH = 64;     // X
        let MAP_HEIGHT = 100;    // Z

        this.camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

        // First Person Camera Controls
        this.person = new Object3D();
        this.person.add(this.camera);
        this.camera.position.set(0, 1.0, 4.0); // first-person view
        this.viewSet(2);
        this.scene.add(this.person);

        let light = new PointLight(0xffffff);
        light.position.set(100, 250, 100);
        this.scene.add(light);

        // SKYBOX
        let skyBoxGeometry = new CubeGeometry(1000, 1000, 1000);
        let skyBoxMaterial = new MeshBasicMaterial({ color: 0xF0F0F0, side: BackSide });
        let skyBox = new Mesh(skyBoxGeometry, skyBoxMaterial);
        this.scene.add(skyBox);

        var axis = new AxesHelper(33);
        axis.position.y = 0.01;
        this.scene.add(axis);

        // PIANO (su cui verranno incollate le entità)
        this.createPlane(MAP_WIDTH,MAP_HEIGHT);

        this.createLines(MAP_WIDTH,MAP_HEIGHT);

        // SHAPES
        this.cubeGeo     = new CubeGeometry(1, 1, 1);
        this.sphereGeo   = new SphereGeometry(0.25,12,12);
        this.cilinderGeo = new CylinderGeometry(0.35, 0.35,1,12);
        this.boxGeo      = new CubeGeometry(0.35, 0.35,0.65);
        this.coneGeo     = new ConeGeometry(0.5, 1,12);

        this.offset = [
            new Vector3(1, 0, 0), new Vector3(-1, 0, 0),    // x positiva e x negativa
            new Vector3(0, 1, 0), new Vector3(0, -1, 0),    // y positiva e negativa
            new Vector3(0, 0, 1), new Vector3(0, 0, -1)];   // z positiva e negativa

        this.colors = [
            new Color(0x66FFFF),
            new Color(0xff0000),
            new Color(0xff8800),
            new Color(0xffff00),
            new Color(0x00cc00),
            new Color(0x0000ff),
            new Color(0x8800ff),
            new Color(0x804000),
            new Color(0x222222),
            new Color(0xFF66FF)
        ];

        this.materials = { "solid": [], "add": [], "delete": [], "color": [] };
        for (var i = 0; i < this.colors.length; i++) {
            this.materials["solid"][i] = new MeshBasicMaterial({ color: this.colors[i]});
            this.materials["add"][i] = new MeshBasicMaterial({ color: this.colors[i], transparent: true, opacity: 0.5 });
            this.materials["delete"][i] = new MeshBasicMaterial({ color: this.colors[i], transparent: true, opacity: 0.5 });
            this.materials["color"][i] = new MeshBasicMaterial({ color: this.colors[i], transparent: true, opacity: 0.5 });
        }

        // il brush di default
        this.brush = new Mesh(this.cubeGeo.clone(), this.materials["add"][1]);
        this.brush.ignore = true;    // ignored by raycaster
        this.brush.visible = false;
        this.brush.mode = "add";
        this.brush.colorIndex = 1;
        this.scene.add(this.brush);
        this.cubeNames = [];    // array che conterrà tutti gli elementi aggiunti alla mappa
        this.mouse2D = new Vector3(0, 0, 0.5); // coordinate del mouse 
    }

    createLines(mapWidth,mapHeight) {
        let lineMaterial = new LineBasicMaterial({ color: 0x566573 });
        for (let i = 0; i <= mapHeight; i++) {
            let geometry = new Geometry();
            geometry.vertices.push(new Vector3(0, 0.01, i), new Vector3(mapWidth, 0.01, i));
            let line = new Line(geometry, lineMaterial);
            this.scene.add(line);
        }
        for (let i = 0; i <= mapWidth; i++) {
            let geometry = new Geometry();
            geometry.vertices.push(new Vector3(i, 0.01, 0), new Vector3(i, 0.01, mapHeight));
            let line = new Line(geometry, lineMaterial);
            this.scene.add(line);
        }
    }

    createPlane(mapWidth,mapHeight) {
        this.planeGeo = new PlaneGeometry(mapWidth,mapHeight);
        this.planeMat = new MeshBasicMaterial({ /* map: texture,  */ color: 0xFDFEFE });
        this.basePlane = new Mesh(this.planeGeo, this.planeMat);
        this.basePlane.rotation.x = -Math.PI / 2;
        this.basePlane.position.set(mapWidth/2, 0, mapHeight/2);
        this.basePlane.base = true;
        this.scene.add(this.basePlane);
    }

    viewSet(n) {
        // on ground near origin
        if (n == 1) {
            this.person.position.set(-3, 3, 6);
            this.person.rotation.set(0, -Math.PI / 2.0, 0);
            this.camera.rotation.set(-Math.PI / 16.0, 0, 0);
        }
        // birds-eye view
        if (n == 2) {
            this.person.position.set(16, 42, 16);
            this.person.rotation.set(0, (-Math.PI / 2.0), 0);
            this.camera.rotation.set(-1.48, 0, 0);
        }
    }

    // update the mouse variable
    mouseMove(event) {
        this.mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse2D.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    mouseClick(event) {
        this.brushAction();
    }

    getShape(index){
        let shape;
        switch (index) {
            case 1: shape = new Mesh(this.cubeGeo.clone()); break;
            case 2: shape = new Mesh(this.sphereGeo.clone()); break;
            case 3: shape = new Mesh(this.sphereGeo.clone()); break;
            case 4: shape = new Mesh(this.sphereGeo.clone()); break;
            case 5: shape = new Mesh(this.sphereGeo.clone()); break;
            case 5: shape = new Mesh(this.cilinderGeo.clone()); break;
            case 6: shape = new Mesh(this.cilinderGeo.clone()); break;
            case 7: shape = new Mesh(this.boxGeo.clone()); break;
            case 8: shape = new Mesh(this.coneGeo.clone()); break;
            default: shape = new Mesh(this.cubeGeo.clone()); break;
        }
        return shape;
    }

    // this.brush.addName = { 
    //     x: intPosition.x, 
    //     y: intPosition.y, 
    //     z: intPosition.z, i: targetCube.colorIndex
    // };
    buildMatrix() {
        let m = []
        for (var i = 32 - 1; i >= 0; i--) {  // X
            let row = [];
            for (var j = 0; j <32; j++) { // Z
                let found = this.cubeNames.find(e => i === e.name.x && j ===  e.name.z)
                if (found) {
                    row.push(found.colorIndex)
                } else {
                    row.push(0);
                }
            }
            m.push(row)
        }
        return m;
    }

    brushAction() {
        if (this.brush.mode == "add") {
            var shape = this.getShape(this.brush.colorIndex);
            shape.material = this.materials["solid"][this.brush.colorIndex];
            shape.position.copy(this.brush.position.clone());
            shape.name = this.brush.addName;
            shape.colorIndex = this.brush.colorIndex;
            // si aggiunge solo se non è stato già inserito
            if(!this.cubeNames.find(e=>e===shape.name)){
                this.scene.add(shape);
                this.cubeNames.push(shape);
            }
        }
        if (this.brush.mode == "delete") {
            var shape = this.scene.getObjectByName(this.brush.targetName);
            this.scene.remove(shape);
            var index = this.cubeNames.indexOf(this.brush.targetName);
            if (index != -1) this.cubeNames.splice(index, 1);
        }
        if (this.brush.mode == "color") {
            var shape = this.scene.getObjectByName(this.brush.targetName);
            if (shape) {
                shape.material = this.materials["solid"][this.brush.colorIndex];
                shape.colorIndex = this.brush.colorIndex;
            }
        }
        console.log(this.cubeNames);
        this.mapForExport = this.buildMatrix();
        console.log(JSON.stringify(this.mapForExport));
    }

    onWindowResize(event) {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.render(this.scene, this.camera);
        this.camera.updateProjectionMatrix();
    }

    update() {
        var delta = this.clock.getDelta();
        var moveDistance = 6 * delta; 			// 5 units per second
        var rotateAngle = Math.PI / 4 * delta;	// pi/4 radians (45 degrees) per second

        this.keyboard.update();

        // move forwards/backwards
        if (this.keyboard.pressed("W"))
            this.person.translateZ(-moveDistance);
        if (this.keyboard.pressed("S"))
            this.person.translateZ(moveDistance);
        // move left/right (strafe)
        if (this.keyboard.pressed("A"))
            this.person.translateX(-moveDistance);
        if (this.keyboard.pressed("D"))
            this.person.translateX(moveDistance);
        // move up/down (fly)
        if (this.keyboard.pressed("R"))
            this.person.translateY(moveDistance);
        if (this.keyboard.pressed("F"))
            this.person.translateY(-moveDistance);
        // turn left/right
        if (this.keyboard.pressed("Q"))
            this.person.rotateY(rotateAngle);
        if (this.keyboard.pressed("E"))
            this.person.rotateY(-rotateAngle);
        // look up/down
        if (this.keyboard.pressed("T"))
            this.camera.rotateX(rotateAngle);
        if (this.keyboard.pressed("G"))
            this.camera.rotateX(-rotateAngle);
        // limit camera to +/- 45 degrees (0.7071 radians) or +/- 60 degrees (1.04 radians) or 85 (1.48)
        this.camera.rotation.x = Mate.clamp(this.camera.rotation.x, -1.48, 1.48);
        // pressing both buttons moves look angle to original position
        var factor = (Math.abs(this.person.rotation.x) < 0.0001) ? -1 : 1;
        if (this.keyboard.pressed("Q") && this.keyboard.pressed("E"))
            this.person.rotateY(-6 * (-Math.PI / 2.0 - this.person.rotation.y) * rotateAngle * factor);
        if (this.keyboard.pressed("T") && this.keyboard.pressed("G"))
            this.camera.rotateX(-6 * this.camera.rotation.x * rotateAngle);

        // set view to Origin
        if (this.keyboard.down("O"))
            this.viewSet(1);
        // set view to bird's-eye-view (Pigeon's-eye-view?)
        if (this.keyboard.down("P"))
            this.viewSet(2);


        // voxel painting controls

        // when digit is pressed, change brush color data
        // TODO: aggiornare l'oggetto da copiare...
        for (var i = 0; i < 10; i++){
            if (this.keyboard.down(i.toString())){
                this.brush.colorIndex = i;
                // console.log(this.brush);
                // let position = this.brush.position.clone();
                // this.scene.remove(this.brush);
                // this.brush =  new Mesh(this.getShape(this.brush.colorIndex));
                // this.brush.material = this.materials["solid"][this.brush.colorIndex];
                // // this.brush.position.copy(position);
                // this.brush.ignore = true;    // ignored by raycaster
                // this.brush.visible = true;
                // this.brush.mode = "add";
                // this.scene.add(this.brush);
            }
        }

        this.brush.material = this.materials["add"][this.brush.colorIndex];

        // brush modes
        if (this.keyboard.down("Z"))
            this.brush.mode = "add";
        if (this.keyboard.down("X"))
            this.brush.mode = "delete";
        if (this.keyboard.down("C"))
            this.brush.mode = "color";

        // perform brush action
        if (this.keyboard.down("V"))
            this.brushAction();
        // delete last cube entered
        if (this.keyboard.down("B") && this.cubeNames.length > 0)
            this.scene.remove(this.scene.getObjectByName(this.cubeNames.pop()));

        var raycaster = new Raycaster()
        raycaster.setFromCamera(this.mouse2D.clone(), this.camera);
        var intersectionList = [];
        intersectionList = raycaster.intersectObjects(this.scene.children);
        var result = null;
        for (var i = 0; i < intersectionList.length; i++) {
            if ((result == null) && (intersectionList[i].object instanceof Mesh) && !(intersectionList[i].object.ignore))
                result = intersectionList[i];
        }

        // brush will only be visible only in "add" mode, when mouse hovers over plane/cube
        this.brush.visible = false;

        // restore appearance of potential delete/(re)color target cube
        var targetCube = this.scene.getObjectByName(this.brush.targetName);
        if (targetCube)
            targetCube.material = this.materials["solid"][targetCube.colorIndex];
        this.brush.targetName = null;

        if (result) {
            // place cube on basePlane
            if ((this.brush.mode == "add") && result.object.base) {
                // this.brush = new Mesh(this.getShape(this.brush.colorIndex), this.materials["add"][this.brush.colorIndex]);
                this.brush.visible = true;
                var intPosition = new Vector3(Math.floor(result.point.x), 0, Math.floor(result.point.z));
                let a = intPosition.clone().add(new Vector3(0.5, 0.5, 0.5));
                this.brush.position.copy(a);
                // this.brush.addName = "X" + intPosition.x + "Y" + intPosition.y + "Z" + intPosition.z;
                this.brush.addName = { x: intPosition.x, y: intPosition.y, z: intPosition.z };
            }
            // delete cube
            if ((this.brush.mode == "delete") && !result.object.base) {
                this.brush.visible = false;
                var intPosition = new Vector3(Math.floor(result.object.position.x),
                    Math.floor(result.object.position.y), Math.floor(result.object.position.z));
                    this.brush.addName = { x: intPosition.x, y: intPosition.y, z: intPosition.z };
                var targetCube = this.scene.getObjectByName(this.brush.targetName);
                if(targetCube){
                    targetCube.material = this.materials["delete"][targetCube.colorIndex];
                }
            }
            //  // (re)color cube
            if ((this.brush.mode == "color") && !result.object.base) {
                this.brush.visible = false;
                var intPosition = new Vector3(Math.floor(result.object.position.x),
                    Math.floor(result.object.position.y), Math.floor(result.object.position.z));
                    this.brush.addName = { x: intPosition.x, y: intPosition.y, z: intPosition.z };
                var targetCube = this.scene.getObjectByName(this.brush.targetName);
                if(targetCube){
                    targetCube.material = this.materials["color"][this.brush.colorIndex];
                }
            }
        }
        this.stats.update();
    }

    loop() {
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
        console.log('WEBGL is not supported!');
    }
}



