import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

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
    this.disableVR()
  }
  
  enableVR() {
    this.renderer.xr.enabled = true
    this.vrButton = document.querySelector("body").append(VRButton.createButton(this.renderer))
    console.log(this.vrButton)
  }
  
  disableVR() {
    if (this.vrButton) {
      this.renderer.xr.enabled = false
      this.vrButton.remove()
    }
  }
  
  onDrop(file) {

  }
  
  onClick() {

  }
  
  update(time) {

  }
}

export default Scene
