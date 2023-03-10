// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainBaseNode
// ----------------------------------------------

import {SilverRainBase} from './SilverRainBase.js';

class SilverRainBaseNode extends SilverRainBase {
	// Input
	name = undefined;
	setup = undefined;
	cleanup = undefined;
	parentNodes = new Set();
	update = true;
	enable = true;
	constructor(argObject = {}, argDataVar = {}) {
		super();
		this.__loadVar(argDataVar);
		this.__loadArguments(argObject, [
            "name",
            "setup",
            "cleanup",
            "parentNodes",
            "update",
            "enable",
		]);
	}
    __loadVar(argData) {
        for(const [key, value] of Object.entries(argData)) {
            this[key] = value;
        }
    }
    __setup() {
        if(this.__getType(this.setup) === "function") {
            this.setup.call(this);
        }
    }
    __cleanup() {
        if(this.__getType(this.cleanup) === "function") {
            this.cleanup.call(this);
        }
    }
    __isNode(argNode) {
        return SilverRainBaseNode.prototype.isPrototypeOf(argNode);
    }
    __getParentNodes() {
        const nodes = new Set();
		for(const key of this.__input) {
            const object = this[key];
            if(this.__isNode(object)) {
                nodes.add(object);
            }
		}
        for(const parentNode of this.parentNodes) {
            if(this.__isNode(parentNode)) {
                nodes.add(parentNode);
            }
        }
        return nodes;
    }
    addParentNodes(...argNodes) {
        for(const node of argNodes) {
            this.parentNodes.add(node);
        }
        return this;
    }
}

export {SilverRainBaseNode}
