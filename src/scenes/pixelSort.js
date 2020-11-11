import Scene from "../scene"
import * as shaderUtil from "../utils/shader"
import * as textureUtil from "../utils/texture"

const vsSource = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
uniform float uYflip;

void main() {
  vTexCoord = aTexCoord;
  if(uYflip == 1.0) vTexCoord.y = 1.0 - vTexCoord.y;
  gl_Position = vec4(aPosition, 1.0, 1.0);
}
`;
const fsSource = `
precision mediump float;

uniform sampler2D uImage;
uniform vec2 uTextureSize;
uniform float uStep;
varying vec2 vTexCoord;

float brightness(vec4 c) {
  return 0.2126*c.x + 0.7152*c.y + 0.0722*c.z;
}

float comp(vec4 a, vec4 b) {
  return brightness(a) - brightness(b);
}

void main() {
  vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
  vec4 color = vec4(0.0);
  
  float parity = fract(uStep/2.0 + vTexCoord.y*uTextureSize.y/2.0);

  if (parity < 0.5) {
    vec4 c1 = texture2D(uImage, vTexCoord);
    vec4 c2 = texture2D(uImage, vTexCoord + vec2(0, onePixel.y));

    if (vTexCoord.y + onePixel.y >= 1.0) color = c1;
    else color = comp(c1, c2) >= 0.0 ? c1 : c2;
  }
  else {
    vec4 c1 = texture2D(uImage, vTexCoord - vec2(0, onePixel.y));
    vec4 c2 = texture2D(uImage, vTexCoord);

    if (vTexCoord.y - onePixel.y <= 0.0) color = c2;
    else color = comp(c2, c1) < 0.0 ? c2 : c1;
  }
  
  gl_FragColor = color;
}
`;

class PixelSortScene extends Scene {
  constructor() {
    super("pixel-sort", 400, 400)

    this.input = document.createElement("input")
    this.input.type = "file"
    this.input.addEventListener("change", (e) => {
      let file = e.target.files[0]
      this.onDrop(file)
    })
    document.querySelector("#canvas-wrapper").append(this.input)

    let gl = this.canvas.getContext("webgl")
    this.program = shaderUtil.initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(this.program)
    
    this.location = {
      position: gl.getAttribLocation(this.program, "aPosition"),
      texCoord: gl.getAttribLocation(this.program, "aTexCoord"),
      textureSize: gl.getUniformLocation(this.program, "uTextureSize"),
      step: gl.getUniformLocation(this.program, "uStep"),
      yflip: gl.getUniformLocation(this.program, "uYflip"),
    }
    
    this.buffer = {}
    this.buffer.position = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), gl.STATIC_DRAW)

    this.buffer.texCoord = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.texCoord)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(this.location.position)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position)
    gl.vertexAttribPointer(this.location.position, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(this.location.texCoord)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.texCoord)
    gl.vertexAttribPointer(this.location.texCoord, 2, gl.FLOAT, false, 0, 0)
  }
  
  onDrop(file) {
    let reader = new FileReader()
    reader.onload = (e) => {
      let image = new Image()
      image.src = e.target.result
      image.onload = () => { this.setImage(image) }
    }
    reader.readAsDataURL(file)
  }
  
  setImage(image) {
    let gl = this.canvas.getContext("webgl")
    
    this.canvas.width = image.width
    this.canvas.height = image.height
    this.originalImageTexture = textureUtil.createAndSetupTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    this.textures = []
    this.framebuffers = []
    for (let ii = 0; ii < 2; ++ii) {
      let texture = textureUtil.createAndSetupTexture(gl)
      this.textures.push(texture)
  
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null)
  
      let fbo = gl.createFramebuffer()
      this.framebuffers.push(fbo)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    }
    
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.step = 0
    gl.uniform2f(this.location.textureSize, image.width, image.height);
    gl.bindTexture(gl.TEXTURE_2D, this.originalImageTexture);
  }
  
  update() {
    if(!this.originalImageTexture) return
    let gl = this.canvas.getContext("webgl")

    let draw = (flip) => {
      flip = flip | 0.0

      gl.clearColor(0, 1, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(this.location.step, this.step);
      gl.uniform1f(this.location.yflip, flip);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.step%2])
    draw()
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.step%2])
    draw(1.0)
    this.step++
  }
}

export default PixelSortScene
