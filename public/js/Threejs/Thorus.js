//import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';

main();

function main() {
  var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 8;
            
	var canvas = document.getElementById("canvas")
	var renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)

  //controls
  //---------------------------------------------------
  var controls = new OrbitControls(camera, renderer.domElement);

	//---------------------------------------------------
  //make light
  //---------------------------------------------------
  var ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight)

  var sphere = new THREE.SphereGeometry(0.1, 32, 16);

  var pointLightRED = new THREE.PointLight(0xff0040, 2, 50);
	pointLightRED.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0000 })));
	scene.add(pointLightRED);

	var pointLightGREEN = new THREE.PointLight(0x0040ff, 2, 50);
	pointLightGREEN.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x00ff00 })));
	scene.add(pointLightGREEN);

	var pointLightBLUE = new THREE.PointLight(0x80ff80, 2, 50);
	pointLightBLUE.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0000ff })));
	scene.add(pointLightBLUE);

	var pointLightYELLOW = new THREE.PointLight(0xffaa00, 2, 50);
	pointLightYELLOW.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffff00 })));
	scene.add(pointLightYELLOW);

  //---------------------------------------------------
	//make mesh
	//---------------------------------------------------
	var geometry = new THREE.TorusKnotGeometry( 10, 3, 170, 20 );
	var material = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, wireframe: true });
	var mesh = new THREE.Mesh(geometry, material);

  //---------------------------------------------------
	//add mesh to scene
  //---------------------------------------------------
	scene.add(mesh);
	
  function animate() {
		requestAnimationFrame( animate );

    mesh.rotation.y += 0.002;

    const time = Date.now() * 0.0009;

    pointLightRED.position.x = Math.sin(time * 0.5) * 30;
    pointLightRED.position.y = Math.cos(time * 0.3) * 30;
    pointLightRED.position.z = Math.cos(time * 0.7) * 30;

    pointLightGREEN.position.x = Math.cos(time * 0.3) * 30;
    pointLightGREEN.position.y = Math.sin(time * 0.7) * 30;
    pointLightGREEN.position.z = Math.sin(time * 0.5) * 30;

    pointLightBLUE.position.x = Math.sin(time * 0.5) * 30;
    pointLightBLUE.position.y = Math.cos(time * 0.5) * 30;
    pointLightBLUE.position.z = Math.sin(time * 0.5) * 30;

    pointLightYELLOW.position.x = Math.cos(time * 0.3) * 30;
    pointLightYELLOW.position.y = Math.sin(time * 0.5) * 30;
    pointLightYELLOW.position.z = Math.cos(time * 0.3) * 30;
        
    controls.update()

    renderer.render(scene, camera);
	};

	animate();
}

window.addEventListener('resize', reportWindowSize);

function reportWindowSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
}
