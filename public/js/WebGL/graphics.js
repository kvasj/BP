var cubeRotation = 0.0;
const cubeVerteces = [
 /*0.0, 2.0, 2.0,
  0.0, 0.0, 2.0,
  2.0, 0.0, 2.0,
  2.0, 2.0, 2.0,

  0.0, 2.0, 0.0,
  0.0, 0.0, 0.0,
  2.0, 0.0, 0.0,
  2.0, 2.0, 0.0,
  */
  // Front face
  -1.0, -1.0,  1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0,  1.0,
 -1.0,  1.0,  1.0,

 // Back face
 -1.0, -1.0, -1.0,
 -1.0,  1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0, -1.0, -1.0,

 // Top face
 -1.0,  1.0, -1.0,
 -1.0,  1.0,  1.0,
  1.0,  1.0,  1.0,
  1.0,  1.0, -1.0,

 // Bottom face
 -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
 -1.0, -1.0,  1.0,

 // Right face
  1.0, -1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0,  1.0,  1.0,
  1.0, -1.0,  1.0,

 // Left face
 -1.0, -1.0, -1.0,
 -1.0, -1.0,  1.0,
 -1.0,  1.0,  1.0,
 -1.0,  1.0, -1.0,
 
];

const indices = [
 /* 0, 1, 2,  0, 2, 3,
  7, 6, 5,  7, 5, 4,
  3, 2, 6,  3, 6, 7,
  4, 0, 3,  4, 3, 7,
  4, 5, 1,  4, 1, 0,
  1, 5, 6,  1, 6, 2,*/

  0,  1,  2,      0,  2,  3,    // front
  4,  5,  6,      4,  6,  7,    // back
  8,  9,  10,     8,  10, 11,   // top
  12, 13, 14,     12, 14, 15,   // bottom
  16, 17, 18,     16, 18, 19,   // right
  20, 21, 22,     20, 22, 23,   // left

];

var colors = setColors();

main();

function main(){

  //Get WebGl context
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl")  || canvas.getContext('experimental-webgl');
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
  }
  
  // Get the strings for our GLSL shaders
  var vertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      vColor = aColor;
      gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
    }`;

  var fragmentShaderSource =`
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }`;

  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  const programInfo = {
    program: shaderProgram,
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
  };

  const buffers = initBuffers(gl);

  // Draw the scene repeatedly
function render() {
    const speed = 0.02;

    drawScene(gl, programInfo, buffers, speed);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource){

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  return shaderProgram;
}

function initBuffers(gl){
  const positionBuffer = createBuffer(gl, gl.ARRAY_BUFFER, cubeVerteces);
  const colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, colors);
  const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices, true);

  return {
    positionBuffer: positionBuffer,
    colorBuffer: colorBuffer,
    indexBuffer: indexBuffer,
  }
}

function drawScene(gl, programInfo, buffers, speed){
  resizeCanvasToDisplaySize(gl.canvas);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

  resizeCanvasToDisplaySize(gl.canvas);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [-0.0, 0.0, -6.0]);  // amount to translate

  mat4.rotate(modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cubeRotation,     // amount to rotate in radians
    [0, 0, 1]);       // axis to rotate around (Z)

  mat4.rotate(modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cubeRotation * .7,// amount to rotate in radians
    [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
  getAttributeLocation(gl, 3, programInfo.program, 'aPosition', buffers.positionBuffer);
  // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
  getAttributeLocation(gl, 4, programInfo.program, 'aColor', buffers.colorBuffer);
  
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
  
  // Set the shader uniforms
  gl.uniformMatrix4fv( programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);   

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const vertexCount = indices.length;
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

  // Update the rotation for the next draw
  cubeRotation += speed;  
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    console.log('Shader compilation error: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createBuffer(gl, bufferType, data, isIndexBuffer = false){
  var buffer = gl.createBuffer();
  gl.bindBuffer(bufferType, buffer);
  if(isIndexBuffer){
    gl.bufferData(bufferType, new Uint16Array(data), gl.STATIC_DRAW);
  } else {
    gl.bufferData(bufferType, new Float32Array(data), gl.STATIC_DRAW);
  }

  return buffer;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.log('Program initialization error: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  return program;
}

function getAttributeLocation(gl, size, program, attributeName, buffer){
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  //var size = size;     // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  var location = gl.getAttribLocation(program, attributeName);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(location);
}

function setColors(){

  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];


  // Convert the array of colors into a table for all the vertices.
  var colors = [];
  //cubeVerteces.length / 4
  for (var i = 0; i <  18 ; ++i) {
    //const c = randomColor();
    const c = faceColors[i];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  return colors;
}

function randomColor() {
  return [Math.random(), Math.random(), Math.random(), 1.0];
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = window.devicePixelRatio;
  const displayWidth  = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}