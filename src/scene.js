class Scene {
  constructor(name, width, height) {
    this.name = name
    this.canvas = document.createElement("canvas")
    this.canvas.width = width | 400
    this.canvas.height = height | 400
    this.canvas.id = name + "-canvas"
    this.canvas.addEventListener('click', this.onClick)
    document.querySelector("#canvas-wrapper").appendChild(this.canvas)
  }

  release() {
    let p = document.querySelector("#canvas-wrapper")
    while(p.hasChildNodes()) p.removeChild(p.lastChild)
  }
  
  onDrop(file) {

  }
  
  onClick() {

  }
  
  update(dt) {

  }
}

export default Scene
