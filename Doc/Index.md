# INTRODUZIONE

Esempio di mini applicazione:

```html
<html>
	<head>
		<title>My first three.js app</title>
		<style>
			body { margin: 0; }
			canvas { width: 100%; height: 100% }
		</style>
	</head>
	<body>
		<script src="js/three.js"></script>
		<script>
			var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

			var renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );

			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

			camera.position.z = 5;

			var animate = function () {
				requestAnimationFrame( animate );

				cube.rotation.x += 0.01;
				cube.rotation.y += 0.01;

				renderer.render( scene, camera );
			};

			animate();
		</script>
	</body>
</html>
```

Ogni oggetto in three.js eredit da un master Object `Object3D` che contiene proprietà di position, rotation,scale:

```Javascript
//Updating or Reading the position, rotation and scale 
someObject.position someObject.rotation someObject.scale 

//Everything has the properties x,y,z to set them individually, like this: 
someObject.position.x = 20; 

//To set them all at once, use.. 
someObject.position.set(20,60,10);
```
Se è stata creata una mesh (come cubi, sphere, etc) ci stanno delle extra properties quali:

```Javascript
//Get geometry of a mesh 
someMesh.geometry 

//This contains the vertices and faces 
//Which are all stored in an array you can loop through 
someMesh.geometry.vertices 
someMesh.geometry.faces
```

Da notare che Three.js per risparmiare risorse "spegne" i cambiamenti Se è stata cambiata la geometria si deve specificare tali cambiamenti:

```Javascript
//Make the geometry dynamic, so it allows updates 
someMesh.geometry.dynamic = true; 
//You get the idea.. 
someMesh.geometry.verticesNeedUpdate = true; 
someMesh.geometry.facesNeedUpdate = true; 
someMesh.geometry.normalsNeedUpdate = true; 
//As an alternative, you can set these flags on the object once at the beginning, to notify the system this will need constant updating.. 
someMesh.__dirtyVertices = true; 
someMesh.__dirtyEdges = true; 
someMesh.__dirtyFaces = true;
```

# Animazioni

Per creare animazioni "lineari":

```Javascript
//Create clock, set autostart to true 
var clock = new THREE.Clock(true); 

//Within the render() function 
//Get the seconds elapsed since last getDelta call 
// delta = change in time since last call (seconds)
delta = clock.getDelta(); 
var moveDistance = 100 * delta;

//Or get the amount of time elapsed since start of the clock/program 
var timeElapsed = clock.getTimeElapsed();

someObj.position.x += movedistance;

// oppure in base a comandi
someObj.translateZ( -moveDistance );
someObj.translateX( -moveDistance );
someObj.rotate.y -= delta
```
Per creare [animazioni complesse](http://sole.github.io/tween.js/examples/03_graphs.html) si possono utilizzare librerie esterne:

```Javascript
<script type='text/javascript' src='tween.js'></script>


//Set position and target coordinates 
var position = { x : 0, y: 300 }; 
var target = { x : 400, y: 50 }; 

//Tell it to tween the 'position' parameter 
//Make the tween last 2 seconds (=2000 milliseconds) 
var tween = new TWEEN.Tween(position).to(target, 2000); 

//Now update the 3D mesh accordingly 
tween.onUpdate(function(){ mesh.position.x = position.x; mesh.position.y = position.y; }); 

//But don't forget, to start the tween 
tween.start(); 

//And also don't forget, to put this into your looping render function 
tween.update();

//Delay the start of the tween 
tween.delay(500); 

//Set a different tweening (easing) function 
tween.easing(TWEEN.Easing.Elastic.InOut); 

//Create a chain of tweens 
//For example: this one loops between firstTween and secondTween 
firstTween.chain(secondTween); 
secondTween.chain(firstTween);

```

E' possibile accedere a specifici oggetti della scena facendo delle query per nome e per id [Source](https://stackoverflow.com/questions/19426559/three-js-access-scene-objects-by-name-or-id):
```Javascript
myObject.name = "objectName";
...
var object = scene.getObjectByName( "objectName" );
or to recursively search the scene graph

var object = scene.getObjectByName( "objectName", true );
Alternatively, you can search by ID.

var object = scene.getObjectById( 4, true );
// three.js r.61 (2015) 
```


E' possibile simulare velocità e accellerazione tramite:
```Javascript
// When the mesh is instantiated
mesh.velocity = new THREE.Vector3(0, 0, 0);
mesh.acceleration = new THREE.Vector3(0, 0, 0);
// Called in the animation loop
function update(delta) {
	// Apply acceleration
	mesh.velocity.add(mesh.acceleration().clone().multiplyScalar(delta));	// con il clone tutte le volte si parte da 0
	// Apply velocity
	mesh.position.add(mesh.velocity.clone().multiplyScalar(delta));
}

// oppure
var halfAccel = mesh.acceleration.clone().multiplyScalar(delta *0.5);
// Apply half acceleration (first half of midpoint formula)
mesh.velocity.add(halfAccel);
// Apply thrust
mesh.position.add(mesh.velocity.clone().multiplyScalar(delta));
// Apply half acceleration (second half of midpoint formula)
mesh.velocity.add(halfAccel);

```
