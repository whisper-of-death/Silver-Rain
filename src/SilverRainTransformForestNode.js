// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//          SilverRainTransformForestNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainTransformForestNode extends SilverRainBaseNode {
	// Input
	forest = {};
	instantCalc = false;
	// Global

	// Local
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"forest",
			"instantCalc"
		]);
		this.__createForest();
        if(this.__getValue(this.enable) && this.__getValue(this.instantCalc)) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
    __createForest() {
// 		const forest = this.__getValue(this.forest);
		for(const node of Object.values(this.forest)) {
			this.__scan(node);
		}
// 		console.log(">", forest);
	}
	__scan(argNode) {
		argNode.worldMatrix = Mat4.identity();
		if(!Object.hasOwn(argNode, "transformMatrix")) {
			argNode.transformMatrix = Mat4.identity();
		}
		for(const [name, node] of Object.entries(argNode)) {
			if(!["transformMatrix", "worldMatrix"].includes(name)) {
				this.__scan(node);
			}
		}

// 		console.log(argNode);
/*
		if(Object.hasOwn(argNode, "children")) {
			for(const node of Object.values(argNode.children)) {
				this.__scan(node);
			}
		}
		*/
	}
	__calculate(argNode, argParentNode = undefined) {
		if(argParentNode) {
			argNode.worldMatrix = Mat4.multiply(argParentNode.worldMatrix, this.__getValue(argNode.transformMatrix));
		} else {
			argNode.worldMatrix = Mat4.copy(this.__getValue(argNode.transformMatrix));
		}
		for(const [name, node] of Object.entries(argNode)) {
			if(!["transformMatrix", "worldMatrix"].includes(name)) {
				this.__calculate(node, argNode);
			}
		}
		/*
		if(Object.hasOwn(argNode, "children")) {
			for(const childNode of Object.values(argNode.children)) {
				this.__calculate(childNode, argNode);
			}
		}
		*/
	}
	calculate() {
// 		const forest = this.__getValue(this.forest);
// 		console.log(forest);
		for(const node of Object.values(this.forest)) {
			this.__calculate(node);
		}
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
}

export {SilverRainTransformForestNode};
