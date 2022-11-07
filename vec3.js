class vec3 {
    constructor(x=0, y=0, z=0) {
        this.x = x
        this.y = y
        this.z = z
    }

    set 0(val) {this.x = val}
    set 1(val) {this.y = val}
    set 2(val) {this.z = val}

    get 0() {return this.x}
    get 1() {return this.y}
    get 2() {return this.z}

    rotate(euler) {
        let pre_rotate = new vec3(this.x, this.y, this.z);
        
        // Rotation about x axis
        pre_rotate = new vec3(
            pre_rotate.x,
            pre_rotate.y*Math.cos(euler.x) - pre_rotate.z*Math.sin(euler.x),
            pre_rotate.y*Math.sin(euler.x) + pre_rotate.z*Math.cos(euler.x)
        )

        // Rotation about y axis   
        pre_rotate = new vec3(
            pre_rotate.x*Math.cos(euler.y) + pre_rotate.z*Math.sin(euler.y),
            pre_rotate.y,
            -pre_rotate.x*Math.sin(euler.y) + pre_rotate.z*Math.cos(euler.y)
        )

        // Rotation about z axis
        return new vec3(
            pre_rotate.x*Math.cos(euler.z) - pre_rotate.y*Math.sin(euler.z),
            pre_rotate.x*Math.sin(euler.z) + pre_rotate.y*Math.cos(euler.z),
            pre_rotate.z
        )
    }

    add(o) {return new vec3(this.x + o.x, this.y + o.y, this.z + o.z)}
    sub(o) {return new vec3(this.x - o.x, this.y - o.y, this.z - o.z)}
    mul(o) {return new vec3(this.x * o.x, this.y * o.y, this.z * o.z)}
    div(o) {return new vec3(this.x / o.x, this.y / o.y, this.z / o.z)}

    muls(s) {return new vec3(this.x * s, this.y * s, this.z * s)}
    divs(s) {return new vec3(this.x / s, this.y / s, this.z / s)}

    
    
    mag() {return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)}
    dot(o) {return this.x*o.x + this.y*o.y + this.z*o.z}

    cross(o) {
        return new vec3(
            this.y * o.z - this.z * o.y,
            this.z * o.x - this.x * o.z,
            this.x * o.y - this.y * o.x
        )
    }
    norm() {
        let m = 1/this.mag()
        return new vec3(this.x*m, this.y*m, this.z*m)
    }
}