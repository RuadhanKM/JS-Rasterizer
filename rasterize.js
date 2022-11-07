var t, b, l, r, worldToCamMatrix, scene, ctx, camRot, camPos, canvas
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

function clipTriToWorldNear(rawTri) {
    let clipped = []
    let unclipped = []
    let cameraTri = []

    for (let i=0; i<3; i++) {
        let camVert = Mat4x4MulVec3(worldToCamMatrix, rawTri[i])
        cameraTri.push(camVert)

        if (-camVert[2] > near) clipped.push(camVert); else unclipped.push(camVert)
    }

    let numClipped = clipped.length
    
    if (numClipped === 3) return [cameraTri]
    else if (numClipped === 2) {
        return [
            [
                clipped[1],
                lineCamSpaceNearIntersect(clipped[0], unclipped[0]),
                lineCamSpaceNearIntersect(clipped[1], unclipped[0]),
            ],
            [
                clipped[0],
                clipped[1],
                lineCamSpaceNearIntersect(clipped[0], unclipped[0]),
            ]
        ]
    }
    else if (numClipped === 1) {
        return [[
            clipped[0],
            lineCamSpaceNearIntersect(clipped[0], unclipped[0]),
            lineCamSpaceNearIntersect(clipped[0], unclipped[1]),
        ]]
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
    let depthBuffer = new Array(canvas.width * canvas.height).fill(far)

    gameLoop()

    worldToCamMatrix = Mat4x4Inv(camToMatrix(camRot, camPos))

    let sceneLen = scene.scene.length
    for (let objectIndex=0; objectIndex<sceneLen; objectIndex++) {
        let object = scene.scene[objectIndex]

        let objectFaceLen = object.faces.length
        for (let faceIndex=0; faceIndex<objectFaceLen; faceIndex++) {
            let worldTri = TriOffset(TriRotate(TriScale(object.faces[faceIndex], object.scale), object.rot), object.pos)

            let clippedTris = clipTriToWorldNear(worldTri)
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
                        1 / -clipCoords[2] 
                    ]
                    
                    rasterTri.push(clipCoords)
                }

                let bounds = TriGetBoundingBox(rasterTri, canvas.width, canvas.height)

                if (!bounds) {continue}

                let area = 1/edgeFunction(rasterTri[0], rasterTri[1], rasterTri[2])

                for (let y = bounds[2]; y <= bounds[3]; ++y) { 
                    for (let x = bounds[0]; x <= bounds[1]; ++x) {
                        let pixel = [x+0.5, y+0.5, 0]
        
                        let w0 = edgeFunction(rasterTri[1], rasterTri[2], pixel)
                        let w1 = edgeFunction(rasterTri[2], rasterTri[0], pixel)
                        let w2 = edgeFunction(rasterTri[0], rasterTri[1], pixel)
                        
                        if (!((w0 > 0 || w1 > 0 || w2 > 0) && ((w0 < 0 || w1 < 0 || w2 < 0)))) {
                            w0 *= area
                            w1 *= area
                            w2 *= area
                            let z = 1 / (rasterTri[0][2] * w0 + rasterTri[1][2] * w1 + rasterTri[2][2] * w2)

                            if (z < depthBuffer[y * canvas.width + x]) {
                                depthBuffer[y * canvas.width + x] = z
                                let index = y * (canvas.width*4) + (x*4)
                                
                                pixel.z = z
                                let diffuse = V3Dot(TriNormal(worldTri), [0,1,0])
                                let color = [0,255*diffuse,0]

                                pixels[index+0] = color[0]
                                pixels[index+1] = color[1]
                                pixels[index+2] = color[2]
                                pixels[index+3] = 255
                            }
                        }
                    }
                }
            }
        }
    }

    ctx.putImageData(image, 0, 0)

    requestAnimationFrame(loop)
}