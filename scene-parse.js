async function getScene() {
    return fetch("scene.json").then(res => res.json()).then((obj) => {
        let scene = {}

        scene.camPos = [obj.cam.pos.x, obj.cam.pos.y, obj.cam.pos.z]
        scene.camPos = [obj.cam.rot.x, obj.cam.rot.y, obj.cam.rot.z]
        scene.lightDir = V3Norm([obj.lighting.dir.x, obj.lighting.dir.y, obj.lighting.dir.z])
        scene.scene = []

        let promises = []

        for (const element of obj.scene) {
            let obj = {}
            scene.scene.push(obj)

            obj.rot = [element.rot.x, element.rot.y, element.rot.z]
            obj.pos = [element.pos.x, element.pos.y, element.pos.z]
            obj.scale = element.size
            obj.name = element.name
            obj.colorSource = element.colorSource

            if (element.type === "model") {
                promises.push(fetch(element.modelUrl).then(res => res.text()).then((fileData) => {
                    obj.faces = new OBJFile(fileData).parse().models[0].faces
                }))
            }
            if (element.type === "primative") {
                obj.faces = getPrimativeFaces(element.primativeType)
            }

            if (element.colorSource === "texture") {
                let canv = document.createElement("canvas")
                let ctx = canv.getContext("2d")
                let image = new Image()

                promises.push(new Promise(resolve => {
                    image.onload = () => {
                        canv.width = image.width
                        canv.height = image.height
                        ctx.drawImage(image, 0, 0)
                        obj.color = ctx.getImageData(0,0,canv.width,canv.height)

                        resolve()
                    }
                    image.src = element.textureUrl
                }))
            }
            if (element.colorSource === "solid" || !element.colorSource) {
                obj.color = element.color ? [element.color.r, element.color.g, element.color.b] : [255,0,255]
            }
        }

        scene.getObject = (name) => {
            for (const element of scene.scene) {
                if (element.name === name) return element
            }
        }

        return Promise.all(promises).then(_ => {return scene})
    })
}