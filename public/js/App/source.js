var canvas, engine, scene, camera, cameraPosition, light, shadowGenerator;
const chooseBtn = document.getElementById("chooseButton");

createScene();
createCamera();
createLight();
createShadowGenerator();

chooseBtn.addEventListener("change", function() {
    processFile(chooseBtn.value);
})

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});


function createScene(){
    canvas = document.getElementById('canvasBabylonJS');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
}

function createCamera(){
    cameraPosition = new BABYLON.Vector3(0, 0, 0);
    camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 50, cameraPosition, scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
}

function createLight(){
    light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(20, 80, 5);
}

function createShadowGenerator(){
    //for shadow showing have to be other lights than hemispheric 
    shadowGenerator = new BABYLON.ShadowGenerator(512, light);
    BABYLON.SceneLoader.ShowLoadingScreen = false;
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 15;
}

function processFile(filePath){
    if (filePath) {
        clearScene();
        var fileName = filePath.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        BABYLON.SceneLoader.Append("models/", fileName, scene, function (scene) {});
        /*BABYLON.SceneLoader.ImportMesh("", "models/", fileName, scene, function (newMeshes) {
            newMeshes.forEach(mesh => {
                shadowGenerator.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
            });
            camera.target = newMeshes[0]  
        });*/
    }
}

function clearScene(){
    scene.meshes = [];
}