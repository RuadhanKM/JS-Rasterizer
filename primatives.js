function getPrimativeFaces(name) {
    switch (name) {
        case 'plane':
            return [
                new tri(new vec3(1,0,1), new vec3(1,0,-1), new vec3(-1,0,1)),
                new tri(new vec3(-1,0,-1), new vec3(-1,0,1), new vec3(1,0,-1)),
            ]
    }
}