class Rasterizer {
    constructor (canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.tick = 0
        this.rendering = false
        
        this.NDCHeight = 1.2
        this.near = 0.1
        this.far = 500
        this.ratio = canvas.width/canvas.height

        this.updateNDCSize()

        this.camRot = new vec3()
        this.camPos = new vec3(0, 2, 5)

        this.image = this.ctx.createImageData(canvas.width, canvas.height);
        this.pixels = this.image.data
        this.depthBuffer = new Array(canvas.width * canvas.height).fill(this.far)

        this.vertexShader = (clipCoords) => {
            let screenCoords = this.camToScreen(clipCoords)
            let NDCCoords = this.screenToNDC(screenCoords)
            let rasterCoords = this.NDCToRaster(NDCCoords)
            
            return rasterCoords
        }

        this.fragmentShader = (pixel, worldTri) => {
            let diffuse = worldTri.normal().dot(new vec3(0, 1, 0))

            return new vec3(
                worldTri.color.x*diffuse,
                worldTri.color.y*diffuse,
                worldTri.color.z*diffuse
            )
        }

        this.postProcessing = (imageData) => {}

        this.gameLoop = () => {}
    }

    addGameLoop(gameLoop) {
        this.gameLoop = gameLoop
    }

    addFragmentShader(fragmentShader) {
        this.fragmentShader = fragmentShader
    }

    addVertexShader(vertexShader) {
        this.vertexShader = vertexShader
    }

    addPostProcessing(postProcessing) {
        this.postProcessing = postProcessing
    }

    worldToCam(worldCoords) {
        return matrix.camToMatrix(this.camRot, this.camPos).invert().mulVec(worldCoords)
    }

    camToScreen(cameraCoords) {
        return new vec3(
            this.near * cameraCoords.x / -cameraCoords.z,
            this.near * cameraCoords.y / -cameraCoords.z,
            cameraCoords.z
        )
    }

    screenToNDC(screenCoords) {
        return new vec3(
            2 * screenCoords.x / (this.r - this.l) - (this.r + this.l) / (this.r - this.l),
            2 * screenCoords.y / (this.t - this.b) - (this.t + this.b) / (this.t - this.b),
            screenCoords.z
        )
    }

    NDCToRaster(NDCCoords) {
        return new vec3(
            (NDCCoords.x + 1) / 2 * canvas.width,
            (1 - NDCCoords.y) / 2 * canvas.height,
            1 / -NDCCoords.z 
        )
    }

    updateNDCSize() {
        this.ratio = this.canvas.width/this.canvas.height

        this.t = this.NDCHeight*this.near
        this.b = -this.t
        this.r = this.t*this.ratio
        this.l = -this.r
    }

    lineCamSpaceNearIntersect (p0, p1, epsilon=1e-6) {
        let p_no = new vec3(0,0,-1)
        let p_co = new vec3(0,0,-this.near)

        let u = p1.sub(p0)
        let dot = p_no.dot(u)

        if (Math.abs(dot) > epsilon) {
            let w = p0.sub(p_co)
            let fac = -p_no.dot(w) / dot
            u = u.muls(fac)
            return p0.add(u)
        }

        return false
    }

    clipTriToWorldNear(rawTri) {
        let clipped = []
        let cameraTri = rawTri.clone()

        for (let i=0; i<3; i++) {
            cameraTri[i] = this.worldToCam(cameraTri[i])

            clipped.push(-cameraTri[i].z > this.near)
        }

        let numClipped = clipped.filter(a => a).length

        if (numClipped === 3) return [cameraTri]
        if (numClipped === 2) {
            return [
                new tri(
                    (clipped[0] ? cameraTri[0] : this.lineCamSpaceNearIntersect(cameraTri[0], cameraTri[1])),
                    (clipped[1] ? cameraTri[1] : this.lineCamSpaceNearIntersect(cameraTri[1], cameraTri[2])),
                    (clipped[2] ? cameraTri[2] : this.lineCamSpaceNearIntersect(cameraTri[2], cameraTri[0])),
                ),
                new tri(
                    (clipped[0] ? cameraTri[0] : this.lineCamSpaceNearIntersect(cameraTri[0], cameraTri[2])),
                    (clipped[1] ? cameraTri[1] : this.lineCamSpaceNearIntersect(cameraTri[1], cameraTri[0])),
                    (clipped[2] ? cameraTri[2] : this.lineCamSpaceNearIntersect(cameraTri[2], cameraTri[1])),
                )
            ]
        }
        if (numClipped === 1) {
            return [new tri(
                (clipped[0] ? cameraTri[0] : this.lineCamSpaceNearIntersect(cameraTri[1], cameraTri[2])),
                (clipped[1] ? cameraTri[1] : this.lineCamSpaceNearIntersect(cameraTri[0], cameraTri[2])),
                (clipped[2] ? cameraTri[2] : this.lineCamSpaceNearIntersect(cameraTri[0], cameraTri[1])),
            )]
        }
        if (numClipped === 0) return []
    }

    static edgeFunction(a, b, c) 
    { 
        return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)
    } 

    loop() {
        if (!this.rendering) { return }

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        this.updateNDCSize()

        this.image = this.ctx.createImageData(canvas.width, canvas.height)
        this.pixels = this.image.data
        this.depthBuffer = new Array(canvas.width * canvas.height).fill(this.far)

        this.gameLoop()

        for (const object of this.scene.scene) {
            for (const face of object.faces) {
                let worldTri = face.clone()

                worldTri = worldTri.scale(object.scale)
                worldTri = worldTri.rotate(object.rot)
                worldTri = worldTri.offset(object.pos)

                let clippedTris = this.clipTriToWorldNear(worldTri)

                worldTri.color = object.color

                for (const clipTri of clippedTris) {
                    let rasterTri = new tri(new vec3(), new vec3(), new vec3())

                    for (var n = 0; n < 3; n++) {
                        let clipCoords = clipTri[n]

                        rasterTri[n] = this.vertexShader(clipCoords)
                    }

                    let bounds = rasterTri.getBoundingBox(this.canvas.width, this.canvas.height)

                    if (!bounds) {continue}
            
                    let area = Rasterizer.edgeFunction(rasterTri.a, rasterTri.b, rasterTri.c)
                    
                    for (let y = bounds.y0; y <= bounds.y1; ++y) { 
                        for (let x = bounds.x0; x <= bounds.x1; ++x) {
                            let pixel = new vec3(x+0.5, y+0.5, 0)
            
                            let w0 = Rasterizer.edgeFunction(rasterTri.b, rasterTri.c, pixel)
                            let w1 = Rasterizer.edgeFunction(rasterTri.c, rasterTri.a, pixel)
                            let w2 = Rasterizer.edgeFunction(rasterTri.a, rasterTri.b, pixel)
                            
                            if (!((w0 > 0 || w1 > 0 || w2 > 0) && ((w0 < 0 || w1 < 0 || w2 < 0)))) {
                                w0 /= area
                                w1 /= area
                                w2 /= area
                                let z = 1 / (rasterTri.a.z * w0 + rasterTri.b.z * w1 + rasterTri.c.z * w2)
            
                                if (z < this.depthBuffer[y * canvas.width + x]) {
                                    this.depthBuffer[y * this.canvas.width + x] = z
                                    let index = y * (this.canvas.width*4) + (x*4)
                                    
                                    pixel.z = z
                                    let color = this.fragmentShader(pixel, worldTri)

                                    this.pixels[index+0] = color.x
                                    this.pixels[index+1] = color.y
                                    this.pixels[index+2] = color.z
                                    this.pixels[index+3] = 255
                                }
                            }
                        }
                    }
                }
            }
        }

        this.postProcessing(this.image)

        this.ctx.putImageData(this.image, 0, 0)

        this.tick++
        requestAnimationFrame(() => {this.loop()})
    }

    start() {
        this.rendering = true
        
        this.loop()
    }
}