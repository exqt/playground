import Scene from "../scene"
import * as THREE from "three"

class ThreejsTest extends Scene {
  constructor() {
    super("threejsTest")

    this.time = 0

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera( 75, 800 / 600, 0.1, 1000 )

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
    this.renderer.setSize(800, 600)

    const geometry = new THREE.BoxGeometry()
    
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        let material = new THREE.MeshPhongMaterial({color: Math.floor(Math.random()*0xffffff)})
        let cube = new THREE.Mesh( geometry, material )
        cube.position.x = i*2
        cube.position.z = j*2
        this.scene.add(cube)
      }
    }

    this.light = new THREE.PointLight(0xffffff)
    this.scene.add(this.light)

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    
    this.enableVR()
    this.renderer.setAnimationLoop((time) => {
      this.update(time)
    })
  }

  update(time) {
    this.time = time / 1000

    this.light.position.x = 2*Math.cos(this.time)
    this.light.position.y = 4
    this.light.position.z = 2*Math.sin(this.time)

    this.camera.position.x = 6*Math.cos(this.time*0.1)
    this.camera.position.y = 4
    this.camera.position.z = 6*Math.sin(this.time*0.1)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    this.renderer.render( this.scene, this.camera )
  }
}

export default ThreejsTest
