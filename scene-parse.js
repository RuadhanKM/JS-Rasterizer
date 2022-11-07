async function getScene() {
    return fetch("scene.json").then(res => res.json()).then((obj) => {
        let scene = {}

        scene.camPos = [obj.cam.pos.x, obj.cam.pos.y, obj.cam.pos.z]
        scene.camPos = [obj.cam.rot.x, obj.cam.rot.y, obj.cam.rot.z]
        scene.lightDir = [obj.lighting.dir.x, obj.lighting.dir.y, obj.lighting.dir.z]
        scene.scene = []

        let promises = []

        for (const element of obj.scene) {
            if (element.type === "model") {
                promises.push(fetch(element.modelUrl).then(res => res.text()).then((obj) => {
                    let objFile = new OBJFile(obj).parse().models[0]

                    objFile.rot = [element.rot.x, element.rot.y, element.rot.z]
                    objFile.pos = [element.pos.x, element.pos.y, element.pos.z]
                    objFile.scale = element.size
                    objFile.color = [255, 0, 0]
                    objFile.name = element.name

                    scene.scene.push(objFile)
                }))
            }
            if (element.type === "primative") {
                let objFile = {}

                objFile.rot = [element.rot.x, element.rot.y, element.rot.z]
                objFile.pos = [element.pos.x, element.pos.y, element.pos.z]
                objFile.scale = element.size
                objFile.color = [255, 0, 0]
                objFile.name = element.name
                objFile.faces = getPrimativeFaces(element.primativeType)

                scene.scene.push(objFile)
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