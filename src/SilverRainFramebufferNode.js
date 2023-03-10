// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainFramebufferNode
// ----------------------------------------------

import {SilverRainFramebuffer3dNode} from './SilverRainFramebuffer3dNode.js';

class SilverRainFramebufferNode extends SilverRainFramebuffer3dNode {
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"width",
			"height",
		]);
		this.__init();
    }
}

export {SilverRainFramebufferNode};
