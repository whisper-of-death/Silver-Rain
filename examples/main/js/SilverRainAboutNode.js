// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              SilverRainAboutNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainAboutNode extends SilverRainBaseNode {
	// Input
	lookatMatrix = undefined;
	projectionMatrix = undefined;
	fontImageSrc = undefined;
	fontJsonSrc = undefined;
	eventNode = undefined;
	scale = 1;
	// Global
	// Local
	__graph = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"lookatMatrix",
			"projectionMatrix",
			"fontImageSrc",
			"fontJsonSrc",
			"eventNode",
			"scale"
		]);
    }
	async init() {
		const items = this.__getValue(this.items);
		const eventNode = this.__getValue(this.eventNode);
		const nodes = [
			"graph",
			"function",
			"drawText",
			"sdfFont",
			"transformForest",
		];
		await this.root.importNodes(...nodes);
		this.__graphNode = this.root.node("graph", {
			name: "Graph",
			clear: false,
		});
		const sdfFont = this.__graphNode.node("sdfFont", {
			name: "Sdf Font",
			imageSrc: this.__getValue(this.fontImageSrc),
			jsonSrc: this.__getValue(this.fontJsonSrc),
			request: {mode: 'cors'},
		});
		await sdfFont.load().catch(e => console.error(e));
		const linkToVika = () => {
			eventNode.link({
				url: "https://t.me/vikketti",
				target: "_blank"
			});
		};
		const linkToWebgl = () => {
			eventNode.link({
				url: "https://github.com/whisper-of-death/Silver-Rain",
				target: "_blank"
			});
		};
		const drawText1 = this.__graphNode.node("drawText", {
			name: "Draw Text",
			text: "Model - Vika",
			transformMatrix: function() {return Mat4.translate(-this.width / 2, 60, 0);},
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			fontNode: sdfFont,
			color:[0,0,0,1],
			smoothSdf: 0.05,
			smoothMsdf: 5,
			size: 42,
// 			size: () => 42 * this.__getValue(this.scale),
			eventNode: eventNode
		});
		const drawText2 = this.__graphNode.node("drawText", {
			name: "Draw Text",
			text: "Programmer - Leonid Petrunya",
			transformMatrix: function() {return Mat4.translate(-this.width / 2, 0, 0);},
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			fontNode: sdfFont,
			color:[0,0,0,1],
			smoothSdf: 0.05,
			smoothMsdf: 5,
			size: 42,
// 			size: () => 42 * this.__getValue(this.scale),
		});
		const drawText3 = this.__graphNode.node("drawText", {
			name: "Draw Text",
			text: "WebGL framework - 'Silver Rain'",
			transformMatrix: function() {return Mat4.translate(-this.width / 2, -60, 0);},
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			fontNode: sdfFont,
			color:[0,0,0,1],
			smoothSdf: 0.05,
			smoothMsdf: 5,
			size: 42,
// 			size: () => 42 * this.__getValue(this.scale),
			eventNode: eventNode
		});
		eventNode.setCursorStyle({
			object: [drawText1, drawText3],
			cursor: "pointer"
		})
		.addEventListener({
			event: "click",
			object: drawText1,
			phase: "down",
			func: linkToVika
		})
		.addEventListener({
            event: "touchclick",
			object: drawText1,
			phase: "down",
			func: linkToVika
		})
		.addEventListener({
			event: "click",
			object: drawText3,
			phase: "down",
			func: linkToWebgl
		})
		.addEventListener({
            event: "touchclick",
			object: drawText3,
			phase: "down",
			func: linkToWebgl
		});
        this.__graphNode.sort();
        return this;
	}
    __update() {
        if(this.__getValue(this.enable)) {
            this.__setup();
			this.__graphNode.__update();
            this.__cleanup();
        }
    }
    draw() {
        this.__graphNode.__update();
		return this;
    }
}

export {SilverRainAboutNode};
