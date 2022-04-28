
var canvas = document.getElementById('canvasBabylonJS');
var engine = new BABYLON.Engine(canvas, true);

var scene = new BABYLON.Scene(engine);
scene.ambientColor = new BABYLON.Color3(1, 1, 1);

var cameraPosition = new BABYLON.Vector3(0, 0, 0);
var camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 300, cameraPosition, scene);
camera.attachControl(canvas, false);

const max = 100;
var count = 10000;
var boxes = [];
for (let index = 0; index < count; index++) {
    var bO = {
        o: {},
        r: 0,
        s: 0,
    }
    /*var r = Math.random() * 1;
    var g = Math.random() * 1;
    var b = Math.random() * 1;*/

    var radius = Math.floor(Math.random() * max);
    var speed = Math.random() * 5;

    var material = new BABYLON.StandardMaterial('material', scene);
    material.emissiveColor = new BABYLON.Color3(0.2,0.5,0.7);

    var box = BABYLON.Mesh.CreateBox("box", 1, scene);
    box.position.set(Math.floor(Math.random() * max), Math.floor(Math.random() * max), Math.floor(Math.random() * max));
    box.material = material;

    bO.o = box;
    bO.r = radius;
    bO.s = speed;
    boxes.push(bO);
}

engine.runRenderLoop(function () {
    scene.render();
    const t = Date.now() * 0.0009;
    boxes.forEach(box => {
        box.o.position.x = Math.cos(t * box.s) * box.r;
        box.o.position.z = Math.sin(t * box.s) * box.r;
    });
});

window.onload = function () {
    var loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
    console.log('Page load time is '+ loadTime);
  }

window.addEventListener('resize', function () {
    engine.resize();
});