// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainTextEffect1Node
// ----------------------------------------------

import {SilverRainTextEffectNode} from './../SilverRainTextEffectNode.js';
import {Mat4} from './../SilverRainMath.js';

class SilverRainTextEffect1Node extends SilverRainTextEffectNode {
	// Input
	timeLine = [];
	// Local
	__startTime = undefined;
	__cInt = undefined;
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"timeLine",
		]);
    }
    __setCurrentInterval() {
		const timeLine = this.__getValue(this.timeLine);
		const cTime = this.__getTime();
		for(const interval of timeLine) {
			const endTime = this.data.lines[interval.numberLine].chars.length * interval.effectDuration;
			if(cTime >= interval.startTime && cTime <= interval.endTime + endTime) {
				this.__cInt = interval;
				return;
			}
		}
		this.__cInt = undefined;
	}
	__getTime() {
		return performance.now() - this.__startTime;
	}
	draw() {
		this.__copyData();
		if(!this.__startTime) {
			this.data.activeLine = undefined;
			return;
		}
		this.__setCurrentInterval();
		this.data.activeLine = this.__cInt?.numberLine;
		if(this.data.activeLine === undefined) {
			return;
		}
		const chars = this.data.lines[this.data.activeLine].chars;
		const textNode = this.__getValue(this.textNode);
		const len = chars.length;
		for(let i = 0; i < len; i++) {
			const char = chars[i];
			const centerX = (char.v1.x + char.v0.x) / 2;
			const centerY = (char.v2.y + char.v0.y) / 2;
			const delta = 5000;
			const effect = 50;
			const cTime = this.__getTime();
			const deltaTime = cTime - this.__cInt.startTime;
			const e1Start = this.__cInt.startTime + this.__cInt.effectDuration * i;
			const e1End = this.__cInt.startTime + this.__cInt.effectDuration * (i + 1);
			const e2Start = this.__cInt.endTime + this.__cInt.effectDuration * i;
			const e2End = this.__cInt.endTime + this.__cInt.effectDuration * (i + 1);
			let f = undefined;
			if(cTime >= e1Start && cTime <= e1End) {
				f = (cTime - e1Start) / this.__cInt.effectDuration;
			} else if (cTime >= e2Start && cTime <= e2End) {
				f = 1 - (cTime - e2Start) / this.__cInt.effectDuration;
			}
			if(cTime < e1Start || cTime > e2End) {
				char.enable = false;
			}
			if(f) {
				const t1 = Mat4.translate(-centerX, -centerY, 0);
				const s1 = Mat4.scale(f, f, 1);
				const t2 = Mat4.translate(centerX, centerY, 0);
				let f1 = Mat4.multiply(t1, char.transformMatrix);
				f1 = Mat4.multiply(s1, f1);
				f1 = Mat4.multiply(t2, f1);
				char.transformMatrix = f1;
			}
		}
	}
	start() {
		this.__startTime = performance.now();
	}
	abort() {
		this.__startTime = undefined;
	}
}

export {SilverRainTextEffect1Node};
