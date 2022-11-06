const canvas = document.querySelector("#canvas")
const rast = new Rasterizer(canvas)

var teapot

getScene(rast).then(e => {
    teapot = e.getObject("teapot")

    rast.scene = e
    rast.start()
})

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

let tick = 0

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
    if (keys[" "]) {
        rast.camPos = rast.camPos.add(new vec3(0,0.3,0))
    }
    if (keys["SHIFT"]) {
        rast.camPos = rast.camPos.add(new vec3(0,0.3,0))
    }

    tick++

    teapot.rot = teapot.rot.add(new vec3(0, 0.1, 0.1))
}

function vert(clipCoords) {
    //clipCoords = clipCoords.add(new vec3(Math.sin((tick+clipCoords.x)/3)/2, Math.sin((tick+clipCoords.y)/3)/2, 0))
    //clipCoords = clipCoords.muls(clipCoords.z/3)

    let screenCoords = this.camToScreen(clipCoords)
    let NDCCoords = this.screenToNDC(screenCoords)
    let rasterCoords = this.NDCToRaster(NDCCoords)
    
    return rasterCoords
}

function frag(pixel, worldTri) {
    let diffuse = worldTri.normal().dot(new vec3(0, 1, 0))

    return new vec3(
        worldTri.color.x*diffuse,
        worldTri.color.y*diffuse,
        worldTri.color.z*diffuse
    )
}

rast.addFragmentShader(frag)
rast.addGameLoop(gameLoop)
rast.addVertexShader(vert)