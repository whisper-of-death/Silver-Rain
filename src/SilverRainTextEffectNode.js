// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainTextEffectNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainTextEffectNode extends SilverRainBaseNode {
	// Input
	textNode = undefined;
	instantDraw = false;
	// Global
	fontNode = undefined;
	data = {}
	// Local
// 	__data = {};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"textNode",
			"instantDraw",
		]);
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        } else {
			this.__copyData();
		}
    }
	__copyData() {
		const textNode = this.__getValue(this.textNode);
		this.fontNode = this.__getValue(textNode.fontNode);
		this.data = JSON.parse(JSON.stringify(textNode.data));
	}
    get width() {
		if(this.data.activeLine !== undefined) {
			return this.data.lines[this.data.activeLine].width;
		} else {
			return undefined;
		}
	}
    get height() {
		if(this.data.activeLine !== undefined) {
			return this.data.lines[this.data.activeLine].height;
		} else {
			return undefined;
		}
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainTextEffectNode};


