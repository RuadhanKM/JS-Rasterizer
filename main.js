const canvas = document.querySelector("#canvas")
const rast = new Rasterizer(canvas, scene)

var keys = []
window.addEventListener("keydown", (e) => {keys[e.key] = true})
window.addEventListener("keyup", (e) => {keys[e.key] = false})

window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) {return}
    rast.camRot.x -= e.movementY/500
    rast.camRot.y -= e.movementX/500
})

canvas.addEventListener("mousedown", (e) => {
    canvas.requestPointerLock()
})

function gameLoop() {
    if (keys["w"]) {
        rast.camPos = rast.camPos.sub(new vec3(0,0,0.3).rotate(rast.camRot))
    }
    if (keys["a"]) {
        rast.camPos = rast.camPos.sub(new vec3(0.3,0,0).rotate(rast.camRot))
    }
    if (keys["s"]) {
        rast.camPos = rast.camPos.add(new vec3(0,0,0.3).rotate(rast.camRot))
    }
    if (keys["d"]) {
        rast.camPos = rast.camPos.add(new vec3(0.3,0,0).rotate(rast.camRot))
    }
}

rast.addGameLoop(gameLoop)

rast.start()