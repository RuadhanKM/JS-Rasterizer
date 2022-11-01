class tri {
    constructor(a,b,c) {
        this.a = a
        this.b = b
        this.c = c
    }

    set 0(val) {this.a = val}
    set 1(val) {this.b = val}
    set 2(val) {this.c = val}

    get 0() {return this.a}
    get 1() {return this.b}
    get 2() {return this.c}

    normal() {
        let edge1
        let edge2

        edge1 = this.b.sub(this.a)
        edge2 = this.c.sub(this.a)
        
        return edge1.cross(edge2).norm()
    }

    getBoundingBox(imageWidth, imageHeight) {
        let xmin = Math.min(this.a.x, this.b.x, this.c.x)
        let ymin = Math.min(this.a.y, this.b.y, this.c.y)
        let xmax = Math.max(this.a.x, this.b.x, this.c.x)
        let ymax = Math.max(this.a.y, this.b.y, this.c.y)
 
        // the triangle is out of screen
        if (xmin > imageWidth - 1 || xmax < 0 || ymin > imageHeight - 1 || ymax < 0) {return false}

        let res = {}

        res.x0 = (Math.max(0, Math.floor(xmin)))
        res.x1 = (Math.min(imageWidth - 1, Math.floor(xmax)))
        res.y0 = (Math.max(0, Math.floor(ymin)))
        res.y1 = (Math.min(imageHeight - 1, Math.floor(ymax)))
        
        return res
    }

    clone() {
        return new tri(
            new vec3(this.a.x, this.a.y, this.a.z),
            new vec3(this.b.x, this.b.y, this.b.z),
            new vec3(this.c.x, this.c.y, this.c.z),
        )
    } 
}