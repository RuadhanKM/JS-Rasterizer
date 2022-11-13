function TriNormal(t) {
    return V3Norm(V3Cross(V3Sub(t[1], t[0]), V3Sub(t[2], t[0])))
}

function TriGetBoundingBox(tri, imageWidth, imageHeight) {
    let xmin = Math.min(tri[0][0], tri[1][0], tri[2][0])
    let ymin = Math.min(tri[0][1], tri[1][1], tri[2][1])
    let xmax = Math.max(tri[0][0], tri[1][0], tri[2][0])
    let ymax = Math.max(tri[0][1], tri[1][1], tri[2][1])

    // the triangle is out of screen
    if (xmin > imageWidth - 1 || xmax < 0 || ymin > imageHeight - 1 || ymax < 0) {return false}

    return [Math.max(0, Math.floor(xmin)), Math.min(imageWidth - 1, Math.floor(xmax)), Math.max(0, Math.floor(ymin)), Math.min(imageHeight - 1, Math.floor(ymax))]
}

function TriScale(tri, fac) {
    return [
        V3MulF(tri[0], fac),
        V3MulF(tri[1], fac),
        V3MulF(tri[2], fac)
    ]
}

function TriOffset(tri, offset) {
    return [
        V3Add(tri[0], offset),
        V3Add(tri[1], offset),
        V3Add(tri[2], offset)
    ]
}

function TriRotate(tri, euler) {
    return [
        V3Rotate(tri[0], euler),
        V3Rotate(tri[1], euler),
        V3Rotate(tri[2], euler)
    ]
}

function TriClone(tri) {
    return [
        [tri[0][0], tri[0][1], tri[0][2]],
        [tri[1][0], tri[1][1], tri[1][2]],
        [tri[2][0], tri[2][1], tri[2][2]]
    ]
}