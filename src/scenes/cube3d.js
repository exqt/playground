import Scene from "../scene"
import * as shaderUtil from "../utils/shader"
import { mat4, vec3 } from "gl-matrix"

const vsSource = `
attribute vec4 aPosition;
attribute vec3 aNormal;

uniform mat4 uView;
uniform mat4 uProjection;

varying vec4 vPosition;
varying vec3 vNormal;

void main() {
  mat4 projectionView = uProjection * uView;

  vPosition = aPosition;
  vNormal = aNormal;

  gl_Position = projectionView * vPosition;
}
`;
const fsSource = `
precision mediump float;

varying vec4 vPosition;
varying vec3 vNormal;

uniform vec3 uLightPosition;

void main() {
  vec3 lightDir = normalize(uLightPosition - vPosition.xyz);
  float dotnl = max(dot(vNormal, lightDir), 0.0);
  
  float L = 0.2 + dotnl;

  gl_FragColor = vec4(vec3(L), 1.0);
}
`;

class Cube3dScene extends Scene {
  constructor() {
    super("cube3d", 400, 400)
    
    this.time = 0

    let gl = this.canvas.getContext("webgl")
    this.program = shaderUtil.initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(this.program)
    
    this.location = {
      position: gl.getAttribLocation(this.program, "aPosition"),
      normal: gl.getAttribLocation(this.program, "aNormal"),

      view: gl.getUniformLocation(this.program, "uView"),
      projection: gl.getUniformLocation(this.program, "uProjection"),
      lightPosition: gl.getUniformLocation(this.program, "uLightPosition"),
    }
    
    this.buffer = {}
    this.buffer.position = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
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
    ]), gl.STATIC_DRAW)

    this.buffer.normal = gl.createBuffer()
    let normals = [
      [0, 0, 1],
      [0, 0, -1],
      [0, 1, 0],
      [0, -1, 0],
      [1, 0, 0],
      [-1, 0, 0],
    ]
    let b = []
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        b.push(normals[i][0])
        b.push(normals[i][1])
        b.push(normals[i][2])
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(b), gl.STATIC_DRAW)

    this.buffer.indices = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ]), gl.STATIC_DRAW)

    {
      gl.enableVertexAttribArray(this.location.position)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
      gl.vertexAttribPointer(this.location.position, 3, gl.FLOAT, false, 0, 0)
    }
    {
      gl.enableVertexAttribArray(this.location.normal)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.normal)
      gl.vertexAttribPointer(this.location.normal, 3, gl.FLOAT, false, 0, 0)
    }
  }

  update(dt) {
    this.time = this.time + dt

    let gl = this.canvas.getContext("webgl")
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let fieldOfView = 45 * Math.PI / 180
    let aspect = this.canvas.width / this.canvas.height
    let zNear = 0.1
    let zFar = 100.0
    let projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    let viewMatrix = mat4.create()
    let c = Math.cos(this.time)
    let s = Math.sin(this.time)
    mat4.lookAt(viewMatrix, vec3.fromValues(6*c, Math.sin(this.time)*3, 6*s), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0))
    
    gl.uniformMatrix4fv(this.location.projection, false, projectionMatrix)
    gl.uniformMatrix4fv(this.location.view, false, viewMatrix)
    gl.uniform3f(this.location.lightPosition, 4, 3, 2)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
  }
}

export default Cube3dScene
