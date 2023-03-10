// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainBase3dNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Vec3} from './SilverRainMath.js';

class SilverRainBase3dNode extends SilverRainBaseNode {

	// Global
	material = new Map();

	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		/*
		this.__loadArguments(argObject, [
		]);
		*/
    }
    __compile() {
		for(const material of this.material.values()) {
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, material.buffer.vertex);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(material.data.vertex), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, material.buffer.normal);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(material.data.normal), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, material.buffer.texture);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(material.data.texture), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		}
	}
    __setMaterial(argObject) {
		if(!this.material.has(argObject.name)) {
			this.material.set(argObject.name, {
				diffuseColor: argObject.diffuseColor,
				data: {
					vertex: [],
					normal: [],
					texture: []
				},
				buffer: {
					vertex: this.gl.createBuffer(),
					normal: this.gl.createBuffer(),
					texture: this.gl.createBuffer()
				}
			})
		}
	}
	__clearMaterial(aName) {
		this.material.delete(aName);
	}
	__addTriangle(argObject) {
		if(!this.material.has(argObject.material)) {
			return;
		}
		const material = this.material.get(argObject.material);
		const v1 = argObject.v1;
		const v2 = argObject.v2;
		const v3 = argObject.v3;
		const vec1 = Vec3.subtract(v2, v1);
		const vec2 = Vec3.subtract(v3, v1);
		const normal = Vec3.normalize(Vec3.cross(vec1, vec2));
		material.data.vertex.push(...v1, ...v2, ...v3);
		material.data.normal.push(...normal, ...normal, ...normal);
		material.data.texture.push(0,0);
		material.data.texture.push(0,0);
		material.data.texture.push(0,0);
	}
}

export {SilverRainBase3dNode};
