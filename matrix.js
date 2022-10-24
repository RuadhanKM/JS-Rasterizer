const depth = 255

class matrix {
    constructor(width, height, identity=false) {
        this.width = width
        this.height = height
        
        this.m = new Array(height);
        var copy = new Array(width);
        
        for (var i = 0; i < width; i++) {
            copy[i] = 0;
        }
        for (var i=0; i < height; i++){
            this.m[i] = copy.slice(0);
            if (identity) {
                this.m[i][i] = 1
            }
        }
    }

    mul(b) {
        let a = this
        let c = new matrix(4, 4);
        
        for (var i = 0; i < 4; ++i) { 
            for (var j = 0; j < 4; ++j) { 
                c.m[i][j] = a.m[i][0] * b.m[0][j] + a.m[i][1] * b.m[1][j] + a.m[i][2] * b.m[2][j] + a.m[i][3] * b.m[3][j]; 
            } 
        } 

        return c;
    }

    mulVec(o) {
        let a, b, c, w
 
        a = o[0] * this.m[0][0] + o[1] * this.m[1][0] + o[2] * this.m[2][0] + this.m[3][0]; 
        b = o[0] * this.m[0][1] + o[1] * this.m[1][1] + o[2] * this.m[2][1] + this.m[3][1]; 
        c = o[0] * this.m[0][2] + o[1] * this.m[1][2] + o[2] * this.m[2][2] + this.m[3][2]; 
        w = o[0] * this.m[0][3] + o[1] * this.m[1][3] + o[2] * this.m[2][3] + this.m[3][3]; 
 
        return new vec3(
            a / w,
            b / w,
            c / w
        )
    }

    static camToMatrix(rot, pos) {
        let m = new matrix(4, 4)

        let xAxis = new vec3(1,0,0).rotate(rot)
        let yAxis = new vec3(0,1,0).rotate(rot)
        let zAxis = new vec3(0,0,1).rotate(rot)

        m.m[0][0] = xAxis[0]
        m.m[0][1] = xAxis[1]
        m.m[0][2] = xAxis[2]
        m.m[0][3] = 0

        m.m[1][0] = yAxis[0]
        m.m[1][1] = yAxis[1]
        m.m[1][2] = yAxis[2]
        m.m[1][3] = 0

        m.m[2][0] = zAxis[0]
        m.m[2][1] = zAxis[1]
        m.m[2][2] = zAxis[2]
        m.m[2][3] = 0

        m.m[3][0] = pos[0]
        m.m[3][1] = pos[1]
        m.m[3][2] = pos[2]
        m.m[3][3] = 1

        return m
    }

    invert(){
        let i, j, k; 
        let s = new matrix(4,4,true); 
        let t = this; 
 
        // Forward elimination
        for (i = 0; i < 3 ; i++) { 
            let pivot = i; 
 
            let pivotsize = t.m[i][i]; 
 
            if (pivotsize < 0) 
                pivotsize = -pivotsize; 
 
                for (j = i + 1; j < 4; j++) { 
                    let tmp = t.m[j][i]; 
 
                    if (tmp < 0) 
                        tmp = -tmp; 
 
                        if (tmp > pivotsize) { 
                            pivot = j; 
                            pivotsize = tmp; 
                        } 
                } 
 
            if (pivotsize == 0) { 
                // Cannot invert singular matrix
                return new matrix(4,4); 
            } 
 
            if (pivot != i) { 
                for (j = 0; j < 4; j++) { 
                    let tmp; 
 
                    tmp = t.m[i][j]; 
                    t.m[i][j] = t.m[pivot][j]; 
                    t.m[pivot][j] = tmp; 
 
                    tmp = s.m[i][j]; 
                    s.m[i][j] = s.m[pivot][j]; 
                    s.m[pivot][j] = tmp; 
                } 
            } 
 
            for (j = i + 1; j < 4; j++) { 
                let f = t.m[j][i] / t.m[i][i]; 
 
                for (k = 0; k < 4; k++) { 
                    t.m[j][k] -= f * t.m[i][k]; 
                    s.m[j][k] -= f * s.m[i][k]; 
                } 
            } 
        } 
 
        // Backward substitution
        for (i = 3; i >= 0; --i) { 
            let f; 
 
            if ((f = t.m[i][i]) == 0) { 
                // Cannot invert singular matrix
                return new matrix(4,4); 
            } 
 
            for (j = 0; j < 4; j++) { 
                t.m[i][j] /= f; 
                s.m[i][j] /= f; 
            } 
 
            for (j = 0; j < i; j++) { 
                f = t.m[j][i]; 
 
                for (k = 0; k < 4; k++) { 
                    t.m[j][k] -= f * t.m[i][k]; 
                    s.m[j][k] -= f * s.m[i][k]; 
                } 
            } 
        }

        return s; 
    }

    log(mes="") {
        let fin = mes+"\n" 

        for (var i of this.m) {
            for (var k of i) {
                fin += k.toString() + " "
            }
            fin += "\n"
        }

        console.log(fin)
    }
}