canvas = document.querySelector("#canvas")
ctx = canvas.getContext("2d")
var teapot

getScene().then(e => {
    teapot = e.getObject("teapot")

    scene = e
    requestAnimationFrame(loop)
})

camPos = [0,2,-5]
camRot = [0,0,0]

var keys = []
window.addEventListener("keydown", (e) => {keys[e.key] = true})
window.addEventListener("keyup", (e) => {keys[e.key] = false})

window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) {return}
    camRot[0] -= e.movementY/500
    camRot[1] -= e.movementX/500
})

canvas.addEventListener("mousedown", (e) => {
    canvas.requestPointerLock()
})

let tick = 0

function gameLoop() {
    if (keys["w"]) {
        camPos = V3Add(camPos, V3Rotate([0,0,-0.3], camRot))
    }
    if (keys["a"]) {
        camPos = V3Add(camPos, V3Rotate([-0.3,0,0], camRot))
    }
    if (keys["s"]) {
        camPos = V3Add(camPos, V3Rotate([0,0,0.3], camRot))
    }
    if (keys["d"]) {
        camPos = V3Add(camPos, V3Rotate([0.3,0,0], camRot))
    }
    if (keys[" "]) {
        camPos = V3Add(camPos, [0,0.3,0])
    }
    if (keys["SHIFT"]) {
        camPos = V3Add(camPos, [0,-0.3,0])
    }

    tick++

    teapot.rot = V3Add(teapot.rot, [0.1, 0.1, 0])
}