

const VERTEX_REGEX = /^v\s/; //'v '
const NORMAL_REGEX = /^vn\s/; //'vn '
const TEXTURE_REGEX = /^vt\s/; //'vt '
const FACE_REGEX = /^f\s/; //'f '
const WHITESPACE_REGEX = /\s+/; //' '

function parseOBJ(text){
    const meshData = {
        verteces: [],
        textureCoords: [],
        normals: [],

        faceIndices: {
            position: [], //for vertex indices
            textcoord: [], //for textcoords indices
            normal: [], //for normals indices
        }
    };

    var lines = text.split('\n');
    var isQuad = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var lineContent = line.split(WHITESPACE_REGEX);
        lineContent.shift();
        
        if(isVertexLine(line)){
            meshData.verteces = meshData.verteces.concat(convertToIntegers(lineContent));
            //meshData.verteces.push(parseFloat(lineContent));
        }
        if(isNormalLine(line)) {
            meshData.normals = meshData.normals.concat(convertToIntegers(lineContent));
            //meshData.normals.push(parseFloat(lineContent));
        }
        if(isTextureLine(line)){
            meshData.textureCoords = meshData.textureCoords.concat(convertToIntegers(lineContent));
            //meshData.textureCoords.push(parseFloat(lineContent));
        }
        if(isFaceLine(line)){
            fillIndices(meshData, lineContent);
            isQuad = isFourIndicesInLine(lineContent);
        }
    }
    if(isQuad){
        meshData.faceIndices.position = triangulatePositionIndices(meshData.faceIndices.position);
    }
    
    return meshData;
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

function fillIndices(meshData, lineContent){
    lineContent.forEach(slashedIndices => {
        var indicesArray = slashedIndices.split('/');
        meshData.faceIndices.position.push(parseInt(indicesArray[0]-1));
        meshData.faceIndices.textcoord.push(parseInt(indicesArray[1]));
        meshData.faceIndices.normal.push(parseInt(indicesArray[2]));
    });

    return meshData;
}

function triangulatePositionIndices(positionIndicesArray){
    var triangulatedPositionIndices = [];
    for(positionIndex = 0; positionIndex < positionIndicesArray.length; positionIndex++){
        if(isFourthIndex(positionIndex)){
            var firstIndexOfNewTriangle = positionIndex - 3;
            var secondIndexOfNewTriangle = positionIndex - 1;
            //meshData.faceIndices.position.concat(meshData.faceIndices.position[firstIndexOfNewTriangle], meshData.faceIndices.position[secondIndexOfNewTriangle], meshData.faceIndices.position[positionIndex]);
            triangulatedPositionIndices.push(positionIndicesArray[firstIndexOfNewTriangle]);
            triangulatedPositionIndices.push(positionIndicesArray[secondIndexOfNewTriangle]);
            triangulatedPositionIndices.push(positionIndicesArray[positionIndex]);
        } else {
            triangulatedPositionIndices.push(positionIndicesArray[positionIndex]);
        }
    }

    return triangulatedPositionIndices;
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