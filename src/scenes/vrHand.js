import Scene from "../scene"
import * as THREE from "three"

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory'

class VRHandScene extends Scene {
  constructor() {
    super("vr-hand")

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera( 75, 800 / 600, 0.1, 1000 )

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
    this.renderer.setSize(800, 600)

    this.light = new THREE.PointLight(0xffffff, 0.3)
    this.scene.add(this.light)
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    
    let planeMesh = new THREE.PlaneGeometry(10, 10)
    let planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
    this.plane = new THREE.Mesh(planeMesh, planeMaterial)
    this.plane.rotateX(-Math.PI/2)
    this.scene.add(this.plane)
    
    // vr stuff
    this.controller1 = this.renderer.xr.getController(0)
    this.scene.add(this.controller1)

    this.controller2 = this.renderer.xr.getController(1)
    this.scene.add(this.controller2)

    const controllerModelFactory = new XRControllerModelFactory()
    const handModelFactory = new XRHandModelFactory().setPath("./models/fbx/")

    // Hand 1
    this.controllerGrip1 = this.renderer.xr.getControllerGrip(0)
    this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
    this.scene.add(this.controllerGrip1)

    this.hand1 = this.renderer.xr.getHand(0)
    this.hand1.add(handModelFactory.createHandModel(this.hand1))
    this.scene.add(this.hand1)

    // Hand 2
    this.controllerGrip2 = this.renderer.xr.getControllerGrip(1)
    this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2))
    this.scene.add(this.controllerGrip2)

    this.hand2 = this.renderer.xr.getHand(1)
    this.hand2.add(handModelFactory.createHandModel(this.hand2))
    this.scene.add(this.hand2)
    
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

    // this.camera.position.x = 6*Math.cos(this.time*0.1)
    // this.camera.position.y = 4
    // this.camera.position.z = 6*Math.sin(this.time*0.1)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    
    this.renderer.render( this.scene, this.camera )
  }
}

export default VRHandScene
