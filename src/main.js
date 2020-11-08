import ColorTriangleScene from "./scenes/colorTriangle"
import PixelSortScene from "./scenes/pixelSort"
import Cube3dScene from "./scenes/cube3d"

const scenes = {
  colorTriangle: ColorTriangleScene,
  pixelSort: PixelSortScene,
  cube3d: Cube3dScene,
}

let currentScene = null
let sceneSelect = document.querySelector("#scene-select")
function loadScene(name) {
  if (scenes[name]) sceneSelect.value = name
  else return false

  if (currentScene) currentScene.release()
  currentScene = new scenes[name]
  return true
}

sceneSelect.onchange = (e) => { loadScene(sceneSelect.value) }

document.ondragover = (e) => { e.stopPropagation(); e.preventDefault() }
document.ondrop = (e) => {
  e.stopPropagation()
  e.preventDefault()
  if (currentScene) {
    let dt = e.dataTransfer
    let file = dt.files[0]
    if (file) currentScene.onDrop(file)
  }
}

for(let [name, cls] of Object.entries(scenes)) {
  let opt = document.createElement("option")
  opt.value = name
  opt.text = name
  sceneSelect.append(opt)
}

//
let urlParams = new URLSearchParams(window.location.search)
let initScene = urlParams.get('scene')
if (!loadScene(initScene)) loadScene("colorTriangle")

// update
let start;
const draw = (timestamp) => { 
  if (start === undefined) start = timestamp
  const dt = (timestamp - start)/1000

  if (currentScene) currentScene.update(dt)
  start = timestamp
  window.requestAnimationFrame(draw)
}
window.requestAnimationFrame(draw)
