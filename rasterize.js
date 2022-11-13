var t, b, l, r, worldToCamMatrix, scene, ctx, camRot, camPos, canvas, depthBuffer
const near = 0.1
const far = 500
const NDCHeight = 1.2

function updateNDCSize() {
    let ratio = canvas.width/canvas.height

    t = NDCHeight*near
    r = t*ratio*2
    
    t = 1/(t*2)
    r = 1/r
}

function lineCamSpaceNearIntersect(p0, p1) {
    let p_no = [0,0,-1]
    let p_co = [0,0,-near]

    let u = V3Sub(p1, p0)
    let dot = V3Dot(p_no, u)

    if (Math.abs(dot) > 1e-6) {
        let w = V3Sub(p0, p_co)
        let fac = -V3Dot(p_no, w) / dot
        u = V3MulF(u, fac)
        return V3Add(p0, u)
    }

    return false
}

function clipTriToWorldNear(cameraTri) {
    let clipped = []
    let unclipped = []

    for (let i=0; i<3; i++) {
        if (-cameraTri[i][2] > near) clipped.push(i); else unclipped.push(i)
    }

    let numClipped = clipped.length
    
    if (numClipped === 3) return [cameraTri]
    else if (numClipped === 2) {
        let newTri = TriClone(cameraTri)

        newTri[unclipped[0]] = lineCamSpaceNearIntersect(newTri[unclipped[0]], newTri[clipped[0]])
        
        cameraTri[clipped[0]] = lineCamSpaceNearIntersect(cameraTri[unclipped[0]], cameraTri[clipped[0]])
        cameraTri[unclipped[0]] = lineCamSpaceNearIntersect(cameraTri[unclipped[0]], cameraTri[clipped[1]])

        return [cameraTri, newTri]
    }
    else if (numClipped === 1) {
        cameraTri[unclipped[0]] = lineCamSpaceNearIntersect(cameraTri[unclipped[0]], cameraTri[clipped[0]])
        cameraTri[unclipped[1]] = lineCamSpaceNearIntersect(cameraTri[unclipped[1]], cameraTri[clipped[0]])

        return [cameraTri]
    }
    else return false
}

function edgeFunction(a, b, c) 
{ 
    return (c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])
} 

function loop() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    updateNDCSize()

    let image = ctx.createImageData(canvas.width, canvas.height)
    let pixels = image.data
    depthBuffer = new Array(canvas.width * canvas.height).fill(far)

    gameLoop()

    worldToCamMatrix = Mat4x4Inv(camToMatrix(camRot, camPos))

    let sceneLen = scene.scene.length
    for (let objectIndex=0; objectIndex<sceneLen; objectIndex++) {
        let object = scene.scene[objectIndex]

        let objectFaceLen = object.faces.length
        for (let faceIndex=0; faceIndex<objectFaceLen; faceIndex++) {
            let worldTri = TriOffset(TriRotate(TriScale(object.faces[faceIndex], object.scale), object.rot), object.pos)
            let worldNormal = TriNormal(worldTri)

            let cameraTri = [Mat4x4MulVec3(worldToCamMatrix, worldTri[0]), Mat4x4MulVec3(worldToCamMatrix, worldTri[1]), Mat4x4MulVec3(worldToCamMatrix, worldTri[2])]

            let clippedTris = clipTriToWorldNear(cameraTri)
            if (!clippedTris) continue

            let clipTriLen = clippedTris.length
            for (let clipTriIndex=0; clipTriIndex<clipTriLen; clipTriIndex++) {
                let rasterTri = []
                let clipTri = clippedTris[clipTriIndex]

                for (var n = 0; n < 3; n++) {
                    let clipCoords = clipTri[n]

                    clipCoords = [ 
                        near * clipCoords[0] / -clipCoords[2],
                        near * clipCoords[1] / -clipCoords[2],
                        clipCoords[2]
                    ]
                    clipCoords = [
                        2 * clipCoords[0] * r,
                        2 * clipCoords[1] * t,
                        clipCoords[2]
                    ]
                    clipCoords = [
                        (clipCoords[0] + 1) / 2 * canvas.width,
                        (1 - clipCoords[1]) / 2 * canvas.height,
                        -clipCoords[2] 
                    ]

                    clipCoords.push(object.faces[faceIndex][n][3]/clipCoords[2])
                    clipCoords.push(object.faces[faceIndex][n][4]/clipCoords[2])

                    rasterTri.push(clipCoords)
                }

                let bounds = TriGetBoundingBox(rasterTri, canvas.width, canvas.height)

                if (!bounds) {continue}

                rasterTri[0][2] = 1/rasterTri[0][2]
                rasterTri[1][2] = 1/rasterTri[1][2]
                rasterTri[2][2] = 1/rasterTri[2][2]

                let area = 1/edgeFunction(rasterTri[0], rasterTri[1], rasterTri[2])

                for (let y = bounds[2]; y <= bounds[3]; ++y) { 
                    for (let x = bounds[0]; x <= bounds[1]; ++x) {
                        let pixel = [x+0.5, y+0.5, 0]

                        let w0 = edgeFunction(rasterTri[1], rasterTri[2], pixel)
                        let w1 = edgeFunction(rasterTri[2], rasterTri[0], pixel)
                        let w2 = edgeFunction(rasterTri[0], rasterTri[1], pixel)
                        
                        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                            w0 *= area
                            w1 *= area
                            w2 *= area

                            let z = 1/(rasterTri[0][2] * w0 + rasterTri[1][2] * w1 + rasterTri[2][2] * w2)

                            if (z < depthBuffer[y * canvas.width + x]) {
                                depthBuffer[y * canvas.width + x] = z
                                let index = y * (canvas.width*4) + (x*4)
                                
                                pixel.z = z

                                let diffuse = V3Dot(worldNormal, V3Norm(scene.lightDir))
                                let color
                                
                                if (object.colorSource === "solid") {
                                    color = object.color
                                }
                                if (object.colorSource === "texture") {
                                    let interpX = (w0 * rasterTri[0][3] + w1 * rasterTri[1][3] + w2 * rasterTri[2][3])*z
                                    let interpY = (w0 * rasterTri[0][4] + w1 * rasterTri[1][4] + w2 * rasterTri[2][4])*z

                                    let nx = Math.floor(interpX*object.color.width)
                                    let ny = Math.floor(interpY*object.color.height)
                                    let texIndex = ny * (object.color.width*4) + (nx*4)

                                    color = [object.color.data[texIndex], object.color.data[texIndex+1], object.color.data[texIndex+2]]
                                }

                                pixels[index+0] = color[0]*diffuse
                                pixels[index+1] = color[1]*diffuse
                                pixels[index+2] = color[2]*diffuse
                                pixels[index+3] = 255
                            }
                        }
                    }
                }
            }
        }
    }

    ctx.putImageData(image, 0, 0)

    postProcessing()

    requestAnimationFrame(loop)
}