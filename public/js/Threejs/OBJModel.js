import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';

const x = 10, y = 10, z = 10;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040)
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(x, y, z);

var canvas = document.getElementById("canvasThreeJS")
var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)

//controls
//---------------------------------------------------
var controls = new OrbitControls(camera, renderer.domElement);

//---------------------------------------------------
//make light
//---------------------------------------------------
var light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(x, y, z);
light.target.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light)

light = new THREE.AmbientLight(0x404040);
scene.add(light);

const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(x, y, z);
//sphere.castShadow = true; //default is false
//sphere.receiveShadow = false; //default
scene.add(sphere);

//make plane
const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

//axes
//---------------------------------------------------
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

//make loader
//---------------------------------------------------
/**
 const mtlLoader = new MTLLoader();
mtlLoader.load('../../models/Skull/Skull.mtl', 
  ( materials ) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('../../models/Skull/Skull.obj', ( object ) => {
      var model = object;
      scene.add(model);
  });
})
 */

//material
var model;
const objLoader = new OBJLoader();
objLoader.load('../../models/human.obj', (object) => {
  model = object;
  model.position.set(0, 4, 0);
  model.traverse(content => {
    content.castShadow = true;
  });

  scene.add(model);
});

function animate() {
  requestAnimationFrame(animate);

  model.rotation.y += 0.01;
  controls.update()
  renderer.render(scene, camera);
};

function reportWindowSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
}

animate();
window.addEventListener('resize', reportWindowSize);