// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             SilverRainEmblemNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainEmblemNode extends SilverRainBaseNode {
	// Input
	src = undefined;
	lookatMatrix = Mat4.identity();
	projectionMatrix = Mat4.identity();
	offsetX = 0;
	offsetY = 0;
	offsetZ = 0;
	scale = 1;
	// Global
	// Local
	__graph = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"src",
			"lookatMatrix",
			"projectionMatrix",
			"offsetX",
			"offsetY",
			"offsetZ",
			"scale"
		]);
    }
	async init() {
		await this.root.importNodes(
			"image",
			"texture",
			"drawTexture"
		);
		this.__graph = this.root.node("graph", {
			name: "Graph",
		});
		const imageNode = this.__graph.node("image", {
			name: "Image",
			src: this.__getValue(this.src),
			request: {mode: 'cors'},
		});
		await imageNode.load().catch(e => console.warn(e));
		const textureNode = this.__graph.node("texture", {
			name: "Texture Node",
			sourceNode: imageNode,
			instantLoad: true,
			update: false,
		});
		imageNode.free();
		const drawTexture = this.__graph.node("drawTexture", {
			name: "Draw Texture",
			transformMatrix: () => {
				const scale = this.__getValue(this.scale);
				const scale2 = scale + Math.sin(performance.now() / 300) * 0.01;
				const offsetX = this.__getValue(this.offsetX);
				const offsetY = this.__getValue(this.offsetY);
				const offsetZ = this.__getValue(this.offsetZ);
				const t1 = Mat4.translate(-textureNode.width / 2, -textureNode.height / 2, 0);
				const s = Mat4.scale(scale2, scale2, 1);
				const t2 = Mat4.translate(
					offsetX - textureNode.width / 2 * scale,
					offsetY - textureNode.height / 2 * scale,
					offsetZ
				);
				let t = Mat4.multiply(s, t1);
				return Mat4.multiply(t2, t);
			},
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: textureNode,
		});
        this.__graph.sort();
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

export {SilverRainEmblemNode};
