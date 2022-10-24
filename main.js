const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")

var camRot = new vec3(0,0,0)
var camPos = new vec3(0,2,5)

var keys = []
window.addEventListener("keydown", (e) => {keys[e.key] = true})
window.addEventListener("keyup", (e) => {keys[e.key] = false})

window.addEventListener("mousemove", (e) => {
    camRot.x -= e.movementY/500
    camRot.y -= e.movementX/500
})

canvas.addEventListener("mousedown", (e) => {
    canvas.requestPointerLock()
})

const near = 0.1
const focalLength = 20
const filmApertureWidth = 0.980
const filmApertureHeight = 0.735
const inchToMm = 25.4

const lightDir = new vec3(0, 1, 0)

function edgeFunction(a, b, c) 
{ 
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)
} 

function gameLoop() {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth

    ctx.fillStyle = "darkgray"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "black"

    if (keys["w"]) {
        camPos = camPos.sub(new vec3(0,0,0.3).rotate(camRot))
    }
    if (keys["a"]) {
        camPos = camPos.sub(new vec3(0.3,0,0).rotate(camRot))
    }
    if (keys["s"]) {
        camPos = camPos.add(new vec3(0,0,0.3).rotate(camRot))
    }
    if (keys["d"]) {
        camPos = camPos.add(new vec3(0.3,0,0).rotate(camRot))
    }
    
    let ratio = canvas.width / canvas.height

    let t = 0.8*near
    let b = -t
    let r = t*ratio
    let l = -r

    let worldToCam = matrix.camToMatrix(camRot, camPos).invert()

    const image = ctx.createImageData(canvas.width, canvas.height);
    const pixels = image.data
    var depthBuffer = new Array(canvas.width * canvas.height)

    for (var i = 0; i < scene.length; i++) {
        let worldTri = scene[i]
        let rasterTri = new tri(new vec3(), new vec3(), new vec3())

        for (var n = 0; n < 3; n++) {
            let worldCoords = worldTri[n]
            let cameraCoords = worldToCam.mulVec(worldCoords)
            
            let screenCoords = new vec3(
                near * cameraCoords.x / -cameraCoords.z,
                near * cameraCoords.y / -cameraCoords.z,
                0
            )

            let NDCCoords = new vec3(
                2 * screenCoords.x / (r - l) - (r + l) / (r - l),
                2 * screenCoords.y / (t - b) - (t + b) / (t - b),
                0
            )

            let rasterCoords = new vec3(
                (NDCCoords.x + 1) / 2 * canvas.width,
                (1 - NDCCoords.y) / 2 * canvas.height,
                -cameraCoords.z 
            )
            
            rasterTri[n] = rasterCoords
        }
        
        let bounds = rasterTri.getBoundingBox(canvas.width, canvas.height)

        if (!bounds) {continue}

        let area = edgeFunction(rasterTri.a, rasterTri.b, rasterTri.c)

        let diffuse = worldTri.normal().dot(lightDir)
        
        for (let y = bounds.y0; y <= bounds.y1; ++y) { 
            for (let x = bounds.x0; x <= bounds.x1; ++x) {
                let pixel = new vec3(x+0.5, y+0.5, 0)

                let w0 = edgeFunction(rasterTri.b, rasterTri.c, pixel)
                let w1 = edgeFunction(rasterTri.c, rasterTri.a, pixel)
                let w2 = edgeFunction(rasterTri.a, rasterTri.b, pixel)
                
                if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                    w0 /= area
                    w1 /= area
                    w2 /= area
                    let z = rasterTri.a.z * w0 + rasterTri.b.z * w1 + rasterTri.c.z * w2
                    
                    if ((z < depthBuffer[y * canvas.width + x] || depthBuffer[y * canvas.width + x] === undefined) && z > near) {
                        depthBuffer[y * canvas.width + x] = z
                        let index = y * (canvas.width*4) + (x*4)

                        pixels[index+0] = 255*diffuse
                        pixels[index+1] = 0
                        pixels[index+2] = 0
                        pixels[index+3] = 255
                    }
                    
                }
            }
        }
    }

    ctx.putImageData(image, 0, 0)

    requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)