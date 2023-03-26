// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//                SilverRainMath
// ----------------------------------------------

// ==================
//        Mat4
// ==================
const Mat4 = function() {};
Mat4.null = function() {
	return new Float32Array(
		[0,0,0,0,
		 0,0,0,0,
		 0,0,0,0,
		 0,0,0,0]
	);
}
Mat4.identity = function() {
	return new Float32Array(
		[1,0,0,0,
		 0,1,0,0,
		 0,0,1,0,
		 0,0,0,1]
	);
}
Mat4.copy = function(a) {
	return new Float32Array(a);
}
Mat4.inverse = function(a) {
	let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	let b00 = a00 * a11 - a01 * a10;
	let b01 = a00 * a12 - a02 * a10;
	let b02 = a00 * a13 - a03 * a10;
	let b03 = a01 * a12 - a02 * a11;
	let b04 = a01 * a13 - a03 * a11;
	let b05 = a02 * a13 - a03 * a12;
	let b06 = a20 * a31 - a21 * a30;
	let b07 = a20 * a32 - a22 * a30;
	let b08 = a20 * a33 - a23 * a30;
	let b09 = a21 * a32 - a22 * a31;
	let b10 = a21 * a33 - a23 * a31;
	let b11 = a22 * a33 - a23 * a32;
	let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	if (!det) {
		return null;
	}
	det = 1.0 / det;
	const out = new Float32Array(16);
	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	return out;
}
Mat4.multiply = function(a, b) {
	// a, b - matrix 4x4
	const out = new Float32Array(16);
	out[0] = a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12];
	out[1] = a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13];
	out[2] = a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14];
	out[3] = a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15];
	out[4] = a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12];
	out[5] = a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13];
	out[6] = a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14];
	out[7] = a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15];
	out[8] = a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12];
	out[9] = a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13];
	out[10] = a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14];
	out[11] = a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15];
	out[12] = a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12];
	out[13] = a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13];
	out[14] = a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14];
	out[15] = a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15];
	return out;
}
Mat4.multiplyByVector = function(a, b) {
	// a - matrix 4x4
    // b - vector
	const out = new Float32Array(4);
	out[0] = a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
	out[1] = a[4]*b[0] + a[5]*b[1] + a[6]*b[2] + a[7]*b[3];
	out[2] = a[8]*b[0] + a[9]*b[1] + a[10]*b[2] + a[11]*b[3];
	out[3] = a[12]*b[0] + a[13]*b[1] + a[14]*b[2] + a[15]*b[3];
	return out;
}
Mat4.transpose = function(a) {
	return new Float32Array(
		[a[0], a[4], a[8], a[12],
		 a[1], a[5], a[9], a[13],
		 a[2], a[6], a[10], a[14],
		 a[3], a[7], a[11], a[15]]
	);
}
Mat4.translate = function(x, y, z) {
	return new Float32Array([
		1, 0, 0, x,
		0, 1, 0, y,
		0, 0, 1, z,
		0, 0, 0, 1
	]);
}
Mat4.rotateXRight = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		1, 0, 0, 0,
		0, cos, -sin, 0,
		0, sin, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateXLeft = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		1, 0, 0, 0,
		0, cos, sin, 0,
		0, -sin, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateYRight = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, 0, sin, 0,
		0, 1, 0, 0,
		-sin, 0, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateYLeft = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, 0, -sin, 0,
		0, 1, 0, 0,
		sin, 0, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateZRight = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, -sin, 0, 0,
		sin, cos, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateZLeft = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, sin, 0, 0,
		-sin, cos, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}
Mat4.scale = function(x, y, z) {
	return new Float32Array([
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1
	]);
}
Mat4.orthoLeft = function(aObject) {
	const x1 = -2 / (aObject.left - aObject.right);
	const x2 = (aObject.left + aObject.right) / (aObject.left - aObject.right);
	const y1 = -2 / (aObject.bottom - aObject.top);
	const y2 = (aObject.bottom + aObject.top) / (aObject.bottom - aObject.top);
	const z1 = -2 / (aObject.near - aObject.far);
	const z2 = (aObject.near + aObject.far) / (aObject.near - aObject.far);
	const out = Mat4.null();
	out[0] = x1;
	out[3] = x2;
	out[5] = y1;
	out[7] = y2;
	out[10] = z1;
	out[11] = z2;
	out[15] = 1;
	return out;
}
Mat4.orthoRight = function(aObject) {
	const x1 = -2 / (aObject.left - aObject.right);
	const x2 = (aObject.left + aObject.right) / (aObject.left - aObject.right);
	const y1 = -2 / (aObject.bottom - aObject.top);
	const y2 = (aObject.bottom + aObject.top) / (aObject.bottom - aObject.top);
	const z1 = 2 / (aObject.near - aObject.far);
	const z2 = (aObject.near + aObject.far) / (aObject.near - aObject.far);
	const out = Mat4.null();
	out[0] = x1;
	out[3] = x2;
	out[5] = y1;
	out[7] = y2;
	out[10] = z1;
	out[11] = z2;
	out[15] = 1;
	return out;
}
Mat4.perspectiveLeft = function(argObject) {
	// near, far, aspect
	const c1 = (2 * argObject.near * argObject.far) / (argObject.near - argObject.far);
	const c2 = (argObject.near + argObject.far) / (argObject.far - argObject.near);
	const fov = Math.tan(Math.PI * argObject.fov / 360);
	const sX = 1 / (argObject.aspect * fov);
	const sY = 1 / fov;
	const out = Mat4.null();
	out[0] = sX;
	out[5] = sY;
	out[10] = c2;
	out[11] = c1;
	out[14] = 1;
	return out;
}
Mat4.perspectiveRight = function(argObject) {
	// near, far, aspect
	const c1 = (2 * argObject.near * argObject.far) / (argObject.near - argObject.far);
	const c2 = (argObject.near + argObject.far) / (argObject.near - argObject.far);
	const fov = Math.tan(Math.PI * argObject.fov / 360);
	const sX = 1 / (argObject.aspect * fov);
	const sY = 1 / fov;
	const out = Mat4.null();
	out[0] = sX;
	out[5] = sY;
	out[10] = c2;
	out[11] = c1;
	out[14] = -1;
	return out;
}
Mat4.lookatLeft = function(argObject) {
	let z = Vec3.subtract(argObject.object, argObject.camera);
	z = Vec3.normalize(z);
	let x = Vec3.cross(argObject.up, z);
	x = Vec3.normalize(x);
	let y = Vec3.cross(z, x);
	y = Vec3.normalize(y);
	const tx = -Vec3.dot(x, argObject.camera);
	const ty = -Vec3.dot(y, argObject.camera);
	const tz = -Vec3.dot(z, argObject.camera);
	const out = Mat4.null();
	out[0] = x[0];
	out[1] = x[1];
	out[2] = x[2];
	out[3] = tx;
	out[4] = y[0];
	out[5] = y[1];
	out[6] = y[2];
	out[7] = ty;
	out[8] = z[0];
	out[9] = z[1];
	out[10] = z[2];
	out[11] = tz;
	out[15] = 1;
	return out;
}
Mat4.lookatRight = function(argObject) {
	let z = Vec3.subtract(argObject.camera, argObject.object);
	z = Vec3.normalize(z);
	let x = Vec3.cross(argObject.up, z);
	x = Vec3.normalize(x);
	let y = Vec3.cross(z, x);
	y = Vec3.normalize(y);
	const tx = -Vec3.dot(x, argObject.camera);
	const ty = -Vec3.dot(y, argObject.camera);
	const tz = -Vec3.dot(z, argObject.camera);
	const out = Mat4.null();
	out[0] = x[0];
	out[1] = x[1];
	out[2] = x[2];
	out[3] = tx;
	out[4] = y[0];
	out[5] = y[1];
	out[6] = y[2];
	out[7] = ty;
	out[8] = z[0];
	out[9] = z[1];
	out[10] = z[2];
	out[11] = tz;
	out[15] = 1;
	return out;
}

// ==================
//        Vec3
// ==================
class Vec3 {
    constructor() {
    }
    static create() {
        return new Float32Array([0, 0, 0]);
    }
    static createFromValues(x, y, z) {
        const out = Vec3.create();
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    static createFromArray(array) {
        const out = Vec3.create();
        out[0] = array[0];
        out[1] = array[1];
        out[2] = array[2];
        return out;
    }
    static copy(a) {
        const out = Vec3.create();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    static length(a) {
        return Math.hypot(a[0], a[1], a[2]);
    }
    static add(a, b) {
        const out = Vec3.create();
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    }
    static subtract(a, b) {
        const out = Vec3.create();
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }
    static multiply(a, b) {
        const out = Vec3.create();
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    }
    static divide(a, b) {
        const out = Vec3.create();
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    }
    static ceil(a) {
        const out = Vec3.create();
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        return out;
    }
    static floor(a) {
        const out = Vec3.create();
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        return out;
    }
    static min(a, b) {
        const out = Vec3.create();
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    }
    static max(a, b) {
        const out = Vec3.create();
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    }
    static round(a) {
        const out = Vec3.create();
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    }
    static scale(a, b) {
        const out = Vec3.create();
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        return out;
    }
    static distance(a, b) {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        const z = b[2] - a[2];
        return Math.hypot(x, y, z);
    }
    static negate(a) {
        const out = Vec3.create();
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    }
    static inverse(a) {
        const out = Vec3.create();
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    }
    static normalize(a) {
        const out = Vec3.create();
        let len = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        return out;
    }
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    static cross(a, b) {
        const out = Vec3.create();
        out[0] = a[1] * b[2] - a[2] * b[1];
        out[1] = a[2] * b[0] - a[0] * b[2];
        out[2] = a[0] * b[1] - a[1] * b[0];
        return out;
	}
    static crossL(a, b) {
        const out = Vec3.create();
        out[0] = a[2] * b[1] - a[1] * b[2];
        out[1] = a[0] * b[2] - a[2] * b[0];
        out[2] = a[1] * b[0] - a[0] * b[1];
        return out;
	}
}

// ==================
//        Quat
// ==================
class Quat {
	constructor() {}
	static null() {
		return new Float32Array([0,0,0,0]);
	}
	static identity() {
		return new Float32Array([1,0,0,0]);
	}
	static setAxisAngle(axis, angle) {
		const out = Quat.null();
		angle = angle * 0.5;
		let s = Math.sin(angle);
		out[0] = Math.cos(angle);
		out[1] = s * axis[0];
		out[2] = s * axis[1];
		out[3] = s * axis[2];
		return out;
	}
	static multiply(q, r) {
		const out = Quat.null();
		out[0] = r[0]*q[0] - r[1]*q[1] - r[2]*q[2] - r[3]*q[3];
		out[1] = r[0]*q[1] + r[1]*q[0] - r[2]*q[3] + r[3]*q[2];
		out[2] = r[0]*q[2] + r[1]*q[3] + r[2]*q[0] - r[3]*q[1];
		out[3] = r[0]*q[3] - r[1]*q[2] + r[2]*q[1] + r[3]*q[0];
		return out;
	}
	static fromVector(vector) {
		return new Float32Array([0, vector[0], vector[1], vector[2]]);
	}
	static conjugate(quat) {
		return new Float32Array([quat[0], -quat[1], -quat[2], -quat[3]]);
	}
	static rotate(vector, quat) {
		const vQuat = Quat.fromVector(vector);
		const cQuat = Quat.conjugate(quat);
		const m1 = Quat.multiply(quat, vQuat);
		const m2 = Quat.multiply(m1, cQuat);
		return new Float32Array([m2[1], m2[2], m2[3]]);
	}
}

export {Mat4, Vec3, Quat};
