function V3Rotate(vec3, euler) {
    // Rotation about x axis
    let pre_rotate = [
        vec3[0],
        vec3[1]*Math.cos(euler[0]) - vec3[2]*Math.sin(euler[0]),
        vec3[1]*Math.sin(euler[0]) + vec3[2]*Math.cos(euler[0])
    ]

    // Rotation about y axis   
    pre_rotate = [
        pre_rotate[0]*Math.cos(euler[1]) + pre_rotate[2]*Math.sin(euler[1]),
        pre_rotate[1],
        -pre_rotate[0]*Math.sin(euler[1]) + pre_rotate[2]*Math.cos(euler[1])
    ]

    // Rotation about z axis
    return [
        pre_rotate[0]*Math.cos(euler[2]) - pre_rotate[1]*Math.sin(euler[2]),
        pre_rotate[0]*Math.sin(euler[2]) + pre_rotate[1]*Math.cos(euler[2]),
        pre_rotate[2]
    ]
}

function V3Add(a, b) {return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]}
function V3Sub(a, b) {return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]}
function V3Mul(a, b) {return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]}
function V3Div(a, b) {return [a[0] / b[0], a[1] / b[1], a[2] / b[2]]}

function V3MulF(a, b) {return [a[0] * b, a[1] * b, a[2] * b]}
function V3MulF(a, b) {return [a[0] / b, a[1] / b, a[2] / b]}


function V3Mag(v) {return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])}
function V3Dot(a, b) {return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]}

function V3Cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ]
}
function V3Norm(v) {
    let m = 1/V3Mag(v)
    return [v[0]*m, v[1]*m, v[2]*m]
}