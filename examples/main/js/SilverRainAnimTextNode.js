// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//            SilverRainAnimTextNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainAnimTextNode extends SilverRainBaseNode {
	// Input
	offsetY = 0;
	fontImageSrc = undefined;
	fontJsonSrc = undefined;
	lookatMatrix = Mat4.identity();
	projectionMatrix = Mat4.identity();
	scale = 1;
	startTime = 3000;
	textTime = 5000;
	pauseTime = 1000;
	effectTime = 50;
	// Global
	// Local
	__textObject = undefined;
	__graph = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"fontImageSrc",
			"fontJsonSrc",
			"lookatMatrix",
			"projectionMatrix",
			"offsetY",
			"scale",
			"startTime",
			"textTime",
			"pauseTime",
			"effectTime",
		]);
    }
	async init() {
		this.root.defineNodes({
			name: "texteffect1",
			class: "SilverRainTextEffect1Node",
			file: "./TextEffects/SilverRainTextEffect1Node.js",
		});
		await this.root.importNodes(
			"graph",
			"drawTexture",
			"textObject",
			"sdfFont",
			"function",
			"drawTextObject",
			"textEffect1"
		);
		this.__graph = this.root.node("graph", {
			name: "Graph",
		});
		const sdfFont = this.__graph.node("sdfFont", {
			imageSrc: this.__getValue(this.fontImageSrc),
			jsonSrc: this.__getValue(this.fontJsonSrc),
			request: {mode: 'cors'},
		});
		await sdfFont.load().catch(e => console.error(e));
		this.__textObject = this.__graph.node("textObject", {
			name: "Text Object",
			fontNode: sdfFont,
			size: () => 48 * this.__getValue(this.scale),
			textArray: [],
			instantDraw: false,
		});
		this.__textEffect = this.__graph.node("textEffect1", {
			name: "Text Effect",
			textNode: this.__textObject,
			timeLine: undefined,
		});
		const drawTextObject = this.__graph.node("drawTextObject", {
			name: "drawTextObject",
			transformMatrix: () => Mat4.translate(-this.__textEffect.width / 2, this.__getValue(this.offsetY), 0),
			lookatMatrix: () => this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textNode: this.__textEffect,
			color:[1,0,0,1],
			smoothSdf: 0.05,
		});
        this.__graph.sort();
        return this;
	}
	setText(aTextArray) {
		const startTime = this.__getValue(this.startTime);
		const textTime = this.__getValue(this.textTime);
		const pauseTime = this.__getValue(this.pauseTime);
		const effectTime = this.__getValue(this.effectTime);
		this.__textObject.textArray = aTextArray;
		this.__textObject.draw();
		const timeLine = [];
		let time = startTime;
		for(let i = 0; i < aTextArray.length; i++) {
			timeLine.push(
				{numberLine: i, startTime: time, endTime: time + textTime , effectDuration: effectTime},
			);
			time += textTime + pauseTime;
		}
		this.__textEffect.timeLine = timeLine;
		return this;
	}
	start() {
		this.__textEffect.start();
		this.enable = true;
        return this;
	}
	abort() {
		this.__textEffect.abort();
		this.enable = false;
        return this;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
			this.__graph.__update();
            this.__cleanup();
        }
    }
    draw() {
        this.__graph.__update();
		return this;
    }
}

export {SilverRainAnimTextNode};
