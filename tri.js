class tri {
    constructor(a,b,c) {
        this[0] = a
        this[1] = b
        this[2] = c
    }

    set a(val) {this[0] = val}
    set b(val) {this[1] = val}
    set c(val) {this[2] = val}

    get a() {return this[0]}
    get b() {return this[1]}
    get c() {return this[2]}

    normal() {
        let edge1
        let edge2

        edge1 = this.b.sub(this.a)
        edge2 = this.c.sub(this.a)
        
        return edge1.cross(edge2).norm()
    }

    getBoundingBox(imageWidth, imageHeight) {
        let xmin = Math.min(this.a.x, Math.min(this.b.x, this.c.x))
        let ymin = Math.min(this.a.y, Math.min(this.b.y, this.c.y))
        let xmax = Math.max(this.a.x, Math.max(this.b.x, this.c.x))
        let ymax = Math.max(this.a.y, Math.max(this.b.y, this.c.y))
 
        // the triangle is out of screen
        if (xmin > imageWidth - 1 || xmax < 0 || ymin > imageHeight - 1 || ymax < 0) {return false}

        let res = {}

        res.x0 = (Math.max(0, Math.floor(xmin))) >>> 0
        res.x1 = (Math.min(imageWidth - 1, Math.floor(xmax))) >>> 0
        res.y0 = (Math.max(0, Math.floor(ymin))) >>> 0
        res.y1 = (Math.min(imageHeight - 1, Math.floor(ymax))) >>> 0

        return res
    }
}