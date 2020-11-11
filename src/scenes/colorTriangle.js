import Scene from "../scene"
import * as shaderUtil from "../utils/shader"

const vsSource = `
attribute vec2 aPosition;
attribute vec4 aColor;
uniform mat2 uMat;
varying vec4 vColor;

void main() {
  vColor = aColor;
  gl_Position = vec4(uMat*aPosition, 1.0, 1.0);
}
`;
const fsSource = `
precision mediump float;

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`;

class ColorTriangleScene extends Scene {
  constructor() {
    super("color-triangle", 400, 400)

    let gl = this.canvas.getContext("webgl")
    this.program = shaderUtil.initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(this.program)
    
    this.location = {
      position: gl.getAttribLocation(this.program, "aPosition"),
      color: gl.getAttribLocation(this.program, "aColor"),
      mat: gl.getUniformLocation(this.program, "uMat"),
    }
    
    this.buffer = {}
    this.buffer.position = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      Math.cos(3/12*2*Math.PI), Math.sin(3/12*2*Math.PI),
      Math.cos(7/12*2*Math.PI), Math.sin(7/12*2*Math.PI),
      Math.cos(11/12*2*Math.PI), Math.sin(11/12*2*Math.PI),
    ]), gl.STATIC_DRAW)

    this.buffer.color = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
    ]), gl.STATIC_DRAW)
    
    {
      gl.enableVertexAttribArray(this.location.position)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
      gl.vertexAttribPointer(this.location.position, 2, gl.FLOAT, false, 0, 0)
    }
    {
      gl.enableVertexAttribArray(this.location.color)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.color)
      gl.vertexAttribPointer(this.location.color, 4, gl.FLOAT, false, 0, 0)
    }
  }

  update(time) {
    this.time = time / 1000

    let gl = this.canvas.getContext("webgl")
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.uniformMatrix2fv(this.location.mat, false, new Float32Array([
      Math.cos(this.time), Math.sin(this.time),
      -Math.sin(this.time), Math.cos(this.time)
    ]))
 
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

export default ColorTriangleScene
