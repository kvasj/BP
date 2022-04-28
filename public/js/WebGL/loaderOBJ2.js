
const VERTEX_REGEX = /^v\s/; //'v '
const NORMAL_REGEX = /^vn\s/; //'vn '
const TEXTURE_REGEX = /^vt\s/; //'vt '
const FACE_REGEX = /^f\s/; //'f '
const MTLLIB_REGEX = /^mtllib\s/; //'mtllib '
const USEMTL_REGEX = /^usemtl\s/; //'usemtl '
const GROUP_REGEX = /^g\s/; //'g '
const OBJECT_REGEX = /^o\s/; //'o '
const WHITESPACE_REGEX = /\s+/; //' '

var allVerteces = [];
var finalData = {
    verteces: [],
    textureCoords: [],
    normals: [],
    meshies: [],
}

//mesh structure
var mesh = {
    object: '',
    groups: '',
    material: '',
    materialLibs: [],
    isQuad: false,
    indices: {
        position: [],
        textcoord: [],
        normal: [],
    },
    buffers: {
        indexBuffer: null,
        colorBuffer: null,
        vertexBuffer: null,
        textureBuffer: null,
        normalBuffer: null,
    }
};

function parseOBJ(text){

    var lines = text.split('\n');
    var isFirstMesh = true;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var lineContent = line.split(WHITESPACE_REGEX);
        lineContent.shift();
        
        if(isVertexLine(line)){
            finalData.verteces = finalData.verteces.concat(convertToIntegers(lineContent));
            finalData.normals = finalData.normals.concat(convertToIntegers(lineContent));
        }
        if(isNormalLine(line)) {
            //finalData.normals = finalData.normals.concat(convertToIntegers(lineContent));
        }
        if(isTextureLine(line)){
            finalData.textureCoords = finalData.textureCoords.concat(convertToIntegers(lineContent));
        }
        if(isFaceLine(line)){
            addIndices(mesh, lineContent);
            mesh.isQuad = isFourIndicesInLine(lineContent);
        }
        if(isMtllibLine(line)){
            mesh.materialLibs.push(lineContent);
        }
        if(isUsemtlLine(line)){
            mesh.material = lineContent;
        }
        if(isGroupLine(line)){
            mesh.groups = lineContent;    
        }
        if(isObjectLine(line)){
            if(!isFirstMesh){
                setMeshToDefaultValues();
            }
            addMesh(mesh);
            mesh.object = lineContent;
            isFirstMesh = false;
        }
    }

    finalData.meshies.forEach(mesh => {
        if(mesh.isQuad){
            mesh.indices.position = triangulateIndices(mesh.indices.position);
        }
    });
    
    return finalData;
}

function addMesh(mesh){
    return finalData.meshies.push(mesh);
}

function setMeshToDefaultValues(){
    mesh = {
        object: '',
        groups: '',
        material: '',
        materialLibs: [],
        verteces: [],
        textureCoords: [],
        normals: [],
        isQuad: false,
        indices: {
            position: [],
            textcoord: [],
            normal: [],
        },
        buffers: {
            indexBuffer: null,
            colorBuffer: null,
            vertexBuffer: null,
            textureBuffer: null,
            normalBuffer: null,
        }
    };
    return mesh;
}

function isFirstMesh(meshiesArray){
    return meshiesArray.length == 0;
}

function isVertexLine(line){
    return VERTEX_REGEX.test(line);
}

function isNormalLine(line){
    return NORMAL_REGEX.test(line);
}

function isTextureLine(line){
    return TEXTURE_REGEX.test(line);
}

function isFaceLine(line){
    return FACE_REGEX.test(line);
}

function isMtllibLine(line){
    return MTLLIB_REGEX.test(line);
}

function isUsemtlLine(line){
    return USEMTL_REGEX.test(line);
}

function isGroupLine(line){
    return GROUP_REGEX.test(line);
}

function isObjectLine(line){
    return OBJECT_REGEX.test(line);
}
function addIndices(mesh, lineContent){
    
    lineContent.forEach(slashedIndices => {
        var indicesArray = slashedIndices.split('/');
        mesh.indices.position.push(parseInt(indicesArray[0])-1);
        mesh.indices.textcoord.push(parseInt(indicesArray[1])-1);
        mesh.indices.normal.push(parseInt(indicesArray[2])-1);
    });

    return mesh;
}

function triangulateIndices(indicesArray){
    var triangulatedIndices = [];
    for(index = 0; index < indicesArray.length; index++){
        if(isFourthIndex(index)){
            var firstIndexOfNewTriangle = index - 3;
            var secondIndexOfNewTriangle = index - 1;

            triangulatedIndices.push(indicesArray[firstIndexOfNewTriangle]);
            triangulatedIndices.push(indicesArray[secondIndexOfNewTriangle]);
            triangulatedIndices.push(indicesArray[index]);
        } else {
            triangulatedIndices.push(indicesArray[index]);
        }
    }

    return triangulatedIndices;
}

function convertToIntegers(array){
    return array.map(Number)
}

function isFourIndicesInLine(lineContent){
    return lineContent.length == 4;
}

function isFourthIndex(positionIndex){
    return (positionIndex + 1) % 4 == 0;
}