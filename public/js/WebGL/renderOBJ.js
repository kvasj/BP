
main();

var colors = setColors();

async function main(){
  //Get WebGl context
  const canvas = document.querySelector("#canvasWebGL");
  const gl = canvas.getContext("webgl")  || canvas.getContext('experimental-webgl');
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
  }

  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  const response = await fetch('../models/chair.obj');
  const text = await response.text();
  var meshData = parseOBJ(text);

  // Get the strings for our GLSL shaders
  var vertexShaderSource = `
    precision mediump float;
    attribute vec4 aPosition;
    attribute vec3 aColor;
    
    uniform mat4 uMatProjection;
    uniform mat4 uMatView;
    uniform mat4 uMatWorld;
    
    varying vec3 vFragColor;
    
    void main() {
      vFragColor = aColor;
      gl_Position = uMatProjection * uMatView * uMatWorld * aPosition;
    }`;

  var fragmentShaderSource =`
    precision mediump float;
    
    varying vec3 vFragColor;

    void main () {
      gl_FragColor = vec4(vFragColor, 1.0);
    }`;
  
  //init shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var colors = setColors();

  var program = createProgram(gl, vertexShader, fragmentShader);

  //init Buffers
  var vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, meshData.verteces);
  var colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, colors);
  var indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, meshData.faceIndices.position, true);
  
  //link attributes location
  var vertexAttribLocation = setAttributeLocation(gl, 3, program, 'aPosition', 0, vertexBuffer);
  var colorAttribLocation = setAttributeLocation(gl, 4, program, 'aColor', 0, colorBuffer);

  gl.useProgram(program);

  var matWorldUniformLocation = getUniformLocation(gl, program, 'uMatWorld');
	var matViewUniformLocation = getUniformLocation(gl, program, 'uMatView');
	var matProjUniformLocation = getUniformLocation(gl, program, 'uMatProjection');
  
  var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 8, -12], [0, 3, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle / 2, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, 0, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.85, 0.85, 0.85, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.drawElements(gl.TRIANGLES, meshData.faceIndices.position.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
  
}


//
//Functions
//
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

  gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

  return program;
}

function setAttributeLocation(gl, size, program, attributeName, offset, buffer){
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  //var size = size;     // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = offset * Float32Array.BYTES_PER_ELEMENT;        // start at the beginning of the buffer
  var atributeLocation = gl.getAttribLocation(program, attributeName);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(atributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(atributeLocation);
}

function getUniformLocation(gl, program, uniformName){
  return gl.getUniformLocation(program, uniformName);
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
  for (var i = 0; i <  6 ; ++i) {
    //const c = randomColor();
    const c = faceColors[3];
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