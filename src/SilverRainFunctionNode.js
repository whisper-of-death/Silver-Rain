// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainFunctionNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainFunctionNode extends SilverRainBaseNode {
	// Input
	code = undefined;
	thisValue = undefined;
	instantCall = false;
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"code",
			"thisValue",
			"instantCall"
		]);
        if(this.__getValue(this.enable) && this.__getValue(this.instantCall)) {
            this.__setup();
            this.call();
            this.__cleanup();
        }
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.call();
            this.__cleanup();
        }
    }
    call() {
        if(this.__getType(this.code) === "function") {
            this.code.call(this.__getValue(this.thisValue));
        }
    }
}

export {SilverRainFunctionNode};
