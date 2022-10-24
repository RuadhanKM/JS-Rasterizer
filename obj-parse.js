var scene = [
    /*new tri(
        new vec3(100, 0, 100),
        new vec3(100, 0, -100),
        new vec3(-100, 0, 100)
    ),
    new tri(
        new vec3(-100, 0, -100),
        new vec3(100, 0, -100),
        new vec3(-100, 0, 100)
    ),*/
]

fetch("test.obj").then(res => res.text()).then((obj) => {
    obj = obj.split("\n")

    for (const line of obj) {

        if (line[0] === "f") {
            let face = line.slice(1, -1).trim().split(" ").map(x => parseInt(x))
            let newTri = new tri(
                new vec3(...obj[face[0]-1].slice(1, -1).trim().split(" ").map(x => parseFloat(x))),
                new vec3(...obj[face[1]-1].slice(1, -1).trim().split(" ").map(x => parseFloat(x))),
                new vec3(...obj[face[2]-1].slice(1, -1).trim().split(" ").map(x => parseFloat(x))),
            ) 

            newTri.color = new vec3(0, 255, 0) 

            scene.push(newTri) 
        }
    }
})