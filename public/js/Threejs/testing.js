import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';

const x = 100, y = 100, z = 100;

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
/*
var light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(x, y, z);
light.target.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light)*/
/*
light = new THREE.AmbientLight(0x404040);
scene.add(light);*/
const geometry = new THREE.BoxGeometry(1, 1, 1);
const max = 100;
var count = 1000;
var boxes = [];
for (let index = 0; index < count; index++) {
  var b = {
    o: {},
    r: 0,
    s: 0,
  }
  const rndColor = THREE.MathUtils.randInt(0, 0xffffff)
  var material = new THREE.MeshBasicMaterial({ color: rndColor });
  var box = new THREE.Mesh(geometry, material);
  box.position.set(Math.floor(Math.random() * max), Math.floor(Math.random() * max), Math.floor(Math.random() * max));
  //box.castShadow = true; //default is false
  //box.receiveShadow = false; //default
  //moving scene
  var radius = Math.floor(Math.random() * max);
  var speed = Math.random() * 5;
  b.o = box;
  b.r = radius;
  b.s = speed;
  boxes.push(b);
  scene.add(box);
}

//axes
//---------------------------------------------------
//const axesHelper = new THREE.AxesHelper(50);
//scene.add(axesHelper);


function animate() {
  requestAnimationFrame(animate);
  const t = Date.now() * 0.0009;
  //moving scene
  boxes.forEach(box => {
    box.o.position.x = Math.cos(t * box.s) * box.r;
    box.o.position.z = Math.sin(t * box.s) * box.r;
  });
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
window.onload = function () {
  var loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
  console.log('Page load time is '+ loadTime);
}
window.addEventListener('resize', reportWindowSize);