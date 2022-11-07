function getPrimativeFaces(name) {
    switch (name) {
        case 'plane':
            return [
                [[1,0,1], [1,0,-1], [-1,0,1]],
                [[-1,0,-1], [-1,0,1], [1,0,-1]]
            ]
    }
}