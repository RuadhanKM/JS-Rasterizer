class Rasterizer {
    constructor (canvas, scene) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.scene = scene
        this.tick = 0
        this.rendering = false
        
        this.NDCHeight = 0.8
        this.near = 0.1
        this.far = 500
        this.ratio = canvas.width/canvas.height

        this.updateNDCSize()

        this.camRot = new vec3()
        this.camPos = new vec3(0, 2, 5)

        this.image = this.ctx.createImageData(canvas.width, canvas.height);
        this.pixels = this.image.data
        this.depthBuffer = new Array(canvas.width * canvas.height).fill(this.far)

        this.vertexShader = (worldCoords) => {
            let cameraCoords = this.worldToCam(worldCoords)
            let screenCoords = this.camToScreen(cameraCoords)
            let NDCCoords = this.screenToNDC(screenCoords)
            
            return this.NDCToRaster(NDCCoords)
        }

        this.fragmentShader = (pixel, rasterTri, worldTri) => {
            let diffuse = worldTri.normal().dot(new vec3(0, 1, 0))

            return new vec3(
                255*diffuse,
                0,
                0
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

        for (var i = 0; i < this.scene.length; i++) {
            let worldTri = this.scene[i]
            let rasterTri = new tri(new vec3(), new vec3(), new vec3())

            let clip = 0

            for (var n = 0; n < 3; n++) {
                let worldCoords = worldTri[n]

                rasterTri[n] = this.vertexShader(worldCoords)

                if (rasterTri[n].z < this.near) {clip++}
            }

            if (clip === 3) continue
            if (clip === 2) {
                
            }
            if (clip === 1) {

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
                    
                    if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                        w0 /= area
                        w1 /= area
                        w2 /= area
                        let z = 1 / (rasterTri.a.z * w0 + rasterTri.b.z * w1 + rasterTri.c.z * w2)
    
                        if (z < this.depthBuffer[y * canvas.width + x]) {
                            this.depthBuffer[y * this.canvas.width + x] = z
                            let index = y * (this.canvas.width*4) + (x*4)
                            
                            let color = this.fragmentShader(pixel, rasterTri, worldTri)

                            this.pixels[index+0] = color.x
                            this.pixels[index+1] = color.y
                            this.pixels[index+2] = color.z
                            this.pixels[index+3] = 255
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