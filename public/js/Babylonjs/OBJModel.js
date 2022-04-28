
var canvas = document.getElementById('canvasBabylonJS');
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
scene.ambientColor = new BABYLON.Color3(1, 1, 1);
var cameraPosition = new BABYLON.Vector3(0, 0, 0);
var camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 50, cameraPosition, scene);
//var camera = new BABYLON.FreeCamera('camera', cameraPosition , scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, false);

//var lightDirection = new BABYLON.Vector3(0, 1, 0)
//var light = new BABYLON.HemisphericLight("light1", lightDirection, scene);
//light.intensity = 0.7;
//light.specular = new BABYLON.Color3(1, 1, 1);

var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
light.position = new BABYLON.Vector3(20, 80, 5);

var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
lightSphere.position = light.position;
lightSphere.material = new BABYLON.StandardMaterial("light", scene);
lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

var material = new BABYLON.StandardMaterial('material', scene);
material.ambientColor = new BABYLON.Color3(1, 0, 0);

var sphere = BABYLON.Mesh.CreateSphere("sphere", 32, 5, scene);
sphere.material = material;
sphere.position.x = -4;
sphere.position.y = 5;

var box = BABYLON.Mesh.CreateBox("box", 5, scene);
box.position.x = 4;
box.position.y = 5;

const size = 100;
var ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: size,
    height: size,
}, scene);

//for shadow showing have to be other lights than hemispheric 
var shadowGenerator = new BABYLON.ShadowGenerator(512, light);

BABYLON.SceneLoader.ShowLoadingScreen = false;
//const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "human.obj", scene);
//let env = result.meshes[0];
//let allMeshes = env.getChildMeshes();


BABYLON.SceneLoader.ImportMesh("", "models/", "minicooper.obj", scene, function (newMeshes) {
    newMeshes.forEach(mesh => {
        mesh.position.y = 10;
        shadowGenerator.getShadowMap().renderList.push(mesh);
        mesh.receiveShadows = true;
    });  
});

//for shadow showing have to be other lights than hemispheric 
shadowGenerator.getShadowMap().renderList.push(box);
shadowGenerator.getShadowMap().renderList.push(sphere);
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.useKernelBlur = true;
shadowGenerator.blurKernel = 15;

ground.receiveShadows = true;

var alpha = 0;
engine.runRenderLoop(function () {
    scene.render();
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    box.position = new BABYLON.Vector3(Math.cos(alpha) * 10, 10, Math.sin(alpha) * 10);
    alpha += 0.01;
});

window.addEventListener('resize', function () {
    engine.resize();
});