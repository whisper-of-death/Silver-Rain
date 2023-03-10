// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainTextObjectNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainTextObjectNode extends SilverRainBaseNode {
	// Input
	fontNode = undefined;
	instantDraw = false;
	textArray = undefined;
	size = undefined;
	// Global
	data = {
		lines: [],
		activeLine: undefined
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"fontNode",
			"instantDraw",
			"textArray",
			"size",
		]);
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
	draw() {
		const textArray = this.__getValue(this.textArray);
		const size = this.__getValue(this.size);
		const fontNode = this.__getValue(this.fontNode);
		let scale = 1;
		if(size > 0) {
			scale = size / fontNode.data.info.size;
		}
		const base = fontNode.data.info.size - fontNode.data.info.base;
		this.data.lines = [];
		for(const text of textArray) {
			const obj = {
				chars: [],
				width: undefined,
				height: undefined
			};
			let offsetX = 0;
			for(let i = 0; i < text.length; i++) {
				const char = text[i];
				if(fontNode.data.chars.has(char)) {
					const g = fontNode.data.chars.get(char);
					const v0 = {
						x: offsetX + g.offsetX * scale,
						y: (fontNode.data.info.size - g.offsetY - g.height - base) * scale
					};
					const v1 = {
						x: v0.x + g.width * scale,
						y: v0.y
					};
					const v2 = {
						x: v0.x,
						y: v0.y + g.height * scale
					};
					const v3 = {
						x: v1.x,
						y: v2.y
					};
					if(i < text.length - 1) {
						const nextChar = text[i+1];
						if(g.kerning.has(nextChar)) {
							offsetX += g.kerning.get(nextChar) * scale;
						}
					}
					offsetX += (g.advance + 4) * scale;
					const t0 = {
						x: g.x,
						y: fontNode.height - (g.y + g.height),
					};
					const t1 = {
						x: t0.x + g.width,
						y: t0.y
					};
					const t2 = {
						x: t0.x,
						y: fontNode.height - g.y,
					};
					const t3 = {
						x: t1.x,
						y: t2.y
					};
					obj.chars.push({
						vertexData: [
							v0.x, v0.y,
							v1.x, v1.y,
							v2.x, v2.y,
							v1.x, v1.y,
							v3.x, v3.y,
							v2.x, v2.y,
						],
						textureData: [
							t0.x, t0.y,
							t1.x, t1.y,
							t2.x, t2.y,
							t1.x, t1.y,
							t3.x, t3.y,
							t2.x, t2.y,
						],
						v0: v0,
						v1: v1,
						v2: v2,
						v3: v3,
						t0: t0,
						t1: t1,
						t2: t2,
						t3: t3,
						transformMatrix: Mat4.identity(),
						color: undefined,
						enable: true
					});
				} else {
					console.warn(`Glyph '${char}' not exist`);
				}
			}
			let minValueX = Infinity, maxValueX = -Infinity, minValueY = Infinity, maxValueY = -Infinity;
			for(const char of obj.chars) {
				minValueX = Math.min(minValueX, char.v0.x, char.v1.x, char.v2.x, char.v3.x);
				maxValueX = Math.max(maxValueX, char.v0.x, char.v1.x, char.v2.x, char.v3.x);
				minValueY = Math.min(minValueY, char.v0.y, char.v1.y, char.v2.y, char.v3.y);
				maxValueY = Math.max(maxValueY, char.v0.y, char.v1.y, char.v2.y, char.v3.y);
			}
			obj.width = maxValueX - minValueX;
			obj.height = maxValueY - minValueY;
			this.data.lines.push(obj);
		}
		return this;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    /*
    width(aLine) {
		return this.data.lines[aLine].width;
	}
    height(aLine) {
		return this.data.lines[aLine].height;
	}
	*/
}

export {SilverRainTextObjectNode};


