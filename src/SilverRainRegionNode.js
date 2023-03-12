// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainRegionNode
// ----------------------------------------------

import {SilverRainBase3dNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainRegionNode extends SilverRainBaseNode {
	// Input
	objectId = undefined;
	v0 = undefined;
	v1 = undefined;
	v2 = undefined;
	v3 = undefined;
	projectionMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	transformMatrix = Mat4.identity();
	eventNode = undefined;
	instantDraw = false;
	// Local
	__inputArray = [
		"objectId",
		"v0",
		"v1",
		"v2",
		"v3",
		"projectionMatrix",
		"lookatMatrix",
		"transformMatrix",
		"eventNode",
		"instantDraw",
	];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, this.__inputArray);
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    draw() {
		const input = this.__objectFromArray(this.__inputArray);
// 		console.log(input);
        if(this.__isNode(input.eventNode)) {
			const calc = (argVector) => {
				let v = Mat4.multiplyByVector(input.transformMatrix, argVector);
				v = Mat4.multiplyByVector(input.lookatMatrix, v);
				v = Mat4.multiplyByVector(input.projectionMatrix, v);
				v[0] = v[0] / v[3];
				v[1] = v[1] / v[3];
				v[2] = v[2] / v[3];
				v[3] = 1;
				return v;
			}
			const v0 = calc([...input.v0, 1]);
			const v1 = calc([...input.v1, 1]);
			const v2 = calc([...input.v2, 1]);
			const v3 = calc([...input.v3, 1]);
			input.eventNode.__setData({
                id: input.objectId,
                data: {
                    t1: {
                        v0: v1,
                        v1: v2,
                        v2: v0,
                    },
                    t2: {
                        v0: v3,
                        v1: v0,
                        v2: v2,
                    },
                }
            });
// 			console.log(v0, v1, v2, v3);
		}
		return true;
	}
	__objectFromArray(array) {
		const obj = {};
		array.forEach(e => obj[e] = this.__getValue(this[e]));
		return obj;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainRegionNode};
