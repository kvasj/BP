
main();

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
  console.log(meshData)

   // Get the strings for our GLSL shaders
  var vertexShaderSource = `
        attribute vec4 a_position;
        attribute vec3 a_normal;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;

        varying vec3 v_normal;

        void main() {
            gl_Position = u_projection * u_view * u_world * a_position;
            v_normal = mat3(u_world) * a_normal;
        }`;

  var fragmentShaderSource =`
        precision mediump float;

        varying vec3 v_normal;

        uniform vec4 u_diffuse;
        uniform vec3 u_lightDirection;

        void main () {
            vec3 normal = normalize(v_normal);
            float fakeLight = dot(u_lightDirection, normal) * 0.5 + 0.6;
            gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
        }`;
  
  var diffuse = [Math.random(), Math.random(), Math.random(), 1];
  var lightDirection = m4.normalize([-100, 0, -100]);

  //init shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  //init Buffers
  var vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, meshData.verteces);
  var textureBuffer = createBuffer(gl, gl.ARRAY_BUFFER, meshData.textureCoords);
  var normalBuffer = createBuffer(gl, gl.ARRAY_BUFFER, meshData.normals);
  mashData = setBuffersToMeshies(gl, meshData);

  //link attributes location
  var vertexAttribLocation = setAttributeLocation(gl, 3, program, 'a_position', 0, vertexBuffer);
  var normalAttribLocation = setAttributeLocation(gl, 3, program, 'a_normal', 0, normalBuffer);
  
  /*meshData.meshies.forEach(mesh => {
      //link attributes location
      var colorAttribLocation = setAttributeLocation(gl, 4, program, 'a_color', 0, mesh.buffers.colorBuffer.buffer);
  });*/
  
  gl.useProgram(program);

  var matWorldUniformLocation = getUniformLocation(gl, program, 'u_world');
  var matViewUniformLocation = getUniformLocation(gl, program, 'u_view');
	var matProjUniformLocation = getUniformLocation(gl, program, 'u_projection');
  var diffuseUniformLocation = getUniformLocation(gl, program, 'u_diffuse');
  var lightDirectionUniformLocation = getUniformLocation(gl, program, 'u_lightDirection');
  
  var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 4, -20], [0, 4, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 5000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  gl.uniform4fv(diffuseUniformLocation, diffuse);
  gl.uniform3fv(lightDirectionUniformLocation, lightDirection);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);  

	//
	// Render loop
	//
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
    meshData.meshies.forEach(mesh => {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.indexBuffer);
      gl.drawElements(gl.TRIANGLES, mesh.indices.position.length, gl.UNSIGNED_SHORT, 0);
    });

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
  //var size = size;     // 3 components per iteration
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

function setBuffersToMeshies(gl, meshData){
  meshData.meshies.forEach(mesh => {
    var colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, [0, 0, 0, 1]);
    var normalBuffer = createBuffer(gl, gl.ARRAY_BUFFER, mesh.indices.normal)
    var indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, mesh.indices.position, true);

    mesh.buffers.indexBuffer = indexBuffer;
    mesh.buffers.colorBuffer = colorBuffer;
    mesh.buffers.normalBuffer = normalBuffer;
  });

  return meshData;
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