function getPrimativeFaces(name) {
    switch (name) {
        case 'plane':
            return [
                [[1,0,1,1,0], [1,0,-1,1,1], [-1,0,1,0,0]],
                [[-1,0,-1,0,1], [-1,0,1,0,0], [1,0,-1,1,1]]
            ]
        case 'cube':
            return [
                // TOP
                [[1,1,1,1,0], [1,1,-1,1,1], [-1,1,1,0,0]],
                [[-1,1,-1,0,1], [-1,1,1,0,0], [1,1,-1,1,1]],

                // BOTTOM
                [[1,-1,-1,1,1], [1,-1,1,1,0], [-1,-1,1,0,0]],
                [[-1,-1,1,0,0], [-1,-1,-1,0,1], [1,-1,-1,1,1]],
                
                // RIGHT
                [[-1,1,1,1,0], [-1,1,-1,1,1], [-1,-1,1,0,0]],
                [[-1,-1,-1,0,1], [-1,-1,1,0,0], [-1,1,-1,1,1]],
                
                // LEFT
                [[1,1,-1,1,1], [1,1,1,1,0], [1,-1,1,0,0]],
                [[1,-1,1,0,0], [1,-1,-1,0,1], [1,1,-1,1,1]],

                // FRONT
                [[1,1,1,1,0], [-1,1,1,1,1], [1,-1,1,0,0]],
                [[-1,-1,1,0,1], [1,-1,1,0,0], [-1,1,1,1,1]],

                // BACK
                [[-1,1,-1,1,1], [1,1,-1,1,0], [1,-1,-1,0,0]],
                [[1,-1,-1,0,0], [-1,-1,-1,0,1], [-1,1,-1,1,1]],
            ]
    }
}