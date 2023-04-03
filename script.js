"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

uniform float u_fudgeFactor;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  vec4 position = u_matrix * a_position;

  // Adjust the z to divide by
  float zToDivideBy = 1.0 + position.z * u_fudgeFactor;

  // Divide x and y by z.
  gl_Position = vec4(position.xyz, zToDivideBy);

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

var numObj = 4, shapes = [];
createArray();
// console.log(shapes);

var gl, program, vao;
var positionAttributeLocation, colorAttributeLocation;
var fudgeLocation, matrixLocation;

function main() {

  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  for (var i = 0; i < numObj; i++) {
    var canvas = document.querySelector(`#canvas${i}`);
     gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }

    // Use our boilerplate utils to compile the shaders and link into a program
     program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    // look up where the vertex data needs to go.
     positionAttributeLocation = gl.getAttribLocation(program, "a_position");
     colorAttributeLocation = gl.getAttribLocation(program, "a_color");
     fudgeLocation = gl.getUniformLocation(program, "u_fudgeFactor");

    // look up uniform locations
     matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer
    var positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
     vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set Geometry.
    setGeometry(gl);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // create the color buffer, make it the current ARRAY_BUFFER
    // and copy in the color values
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl);

    // Turn on the attribute
    gl.enableVertexAttribArray(colorAttributeLocation);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
    var normalize = true;  // convert from 0-255 to 0.0-1.0
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

    // First let's make some variables
    // to hold the translation,
    // var translation = [45, 150, 0];
    // var rotation = [degToRad(40), degToRad(25), degToRad(325)];
    // var scale = [1, 1, 1];
    // var fudgeFactor = 1;

    drawScene(i);
 
    // Setup a ui.
    webglLessonsUI.setupSlider(`#fudgeFactor${i}`, { value: shapes[i].fudgeFactor[i], slide: updateFudgeFactor(i), min: 0, max: 2, step: 0.001, precision: 3 });

    webglLessonsUI.setupSlider(`#x${i}`, { value: shapes[i].translation[0], slide: updatePosition(i, 0), min:0, max: gl.canvas.width });
    webglLessonsUI.setupSlider(`#y${i}`, { value: shapes[i].translation[1], slide: updatePosition(i, 1), min: 0, max: gl.canvas.height });
    webglLessonsUI.setupSlider(`#z${i}`, { value: shapes[i].translation[2], slide: updatePosition(i, 2), min: 0, max: gl.canvas.height});

    webglLessonsUI.setupSlider(`#angleX${i}`, { value: radToDeg(shapes[i].rotation[0]), slide: updateRotation(i, 0), min: 0, max: 360 });
    webglLessonsUI.setupSlider(`#angleY${i}`, { value: radToDeg(shapes[i].rotation[1]), slide: updateRotation(i, 1), min: 0, max: 360 });
    webglLessonsUI.setupSlider(`#angleZ${i}`, { value: radToDeg(shapes[i].rotation[2]), slide: updateRotation(i, 2), min: 0, max: 360 });

    // drawScene(i)

  }

  function updateFudgeFactor(index) {
    return function (event, ui) {
      shapes[index].fudgeFactor = ui.value;
      console.log(index);
      createProgram(index);
      
    };
  }

  function updatePosition(index1, index2) {
    return function (event, ui) {
      shapes[index1].translation[index2] = ui.value;
      console.log(index1, index2);
      createProgram(index1);
      drawScene(index1);
    };
  }

  function updateRotation(index1, index2) {
    return function (event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = degToRad(angleInDegrees);
      shapes[index1].rotation[index2] = angleInRadians;
      console.log(index1, index2);
      createProgram(index1);
      drawScene(index1);
    };
  }

function createProgram(i){
    canvas = document.querySelector(`#canvas${i}`);
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }
    program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
    positionAttributeLocation = gl.getAttribLocation(program, "a_position");
     colorAttributeLocation = gl.getAttribLocation(program, "a_color");
     fudgeLocation = gl.getUniformLocation(program, "u_fudgeFactor");

    // look up uniform locations
     matrixLocation = gl.getUniformLocation(program, "u_matrix");
    drawScene(i);
  }

  // Draw the scene.
  

  // drawScene()
}
var time; 
function drawScene(i) {
  //time = 1000* 0.001;
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // turn on depth testing
  gl.enable(gl.DEPTH_TEST);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Compute the matrix
  var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  matrix = m4.translate(matrix, shapes[i].translation[0], shapes[i].translation[1], shapes[i].translation[2]);
  matrix = m4.xRotate(matrix, shapes[i].rotation[0]);
  matrix = m4.yRotate(matrix, shapes[i].rotation[1]);
  matrix = m4.zRotate(matrix, shapes[i].rotation[2]);
  matrix = m4.scale(matrix, shapes[i].scale[0], shapes[i].scale[1], shapes[i].scale[2]);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  // Set the fudgeFactor
  gl.uniform1f(fudgeLocation, shapes[i].fudgeFactor);

  // Draw the geometry.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 16 * 6;
  gl.drawArrays(primitiveType, offset, count);
  //let u_world = m4.yRotation(time);
  //u_world = m4.translate(u_world, ...objOffset);
}
// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.

function createArray() {
  for (let i = 0; i < numObj; i++) {
    shapes.push({
      translation: [100, 100, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: [Math.random() * 10, Math.random() * 5, Math.random() * 5, 1],
      fudgeFactor: 0.5,
    });
  }
}




main();
