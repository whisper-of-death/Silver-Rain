// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              SilverRainFlagNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainFlagNode extends SilverRainBaseNode {
	// Input
	src = undefined;
	lookatMatrix = Mat4.identity();
	projectionMatrix = Mat4.identity();
	offsetX = 0;
	offsetY = 0;
	offsetZ = 0;
	scale = 0.5;
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
			"video",
			"texture",
			"drawTexture"
		);
		this.__graph = this.root.node("graph", {
			name: "Graph",
		});
		const videoNode = this.__graph.node("video", {
			name: "Video",
			src: this.__getValue(this.src)
		});
		await videoNode.load().catch(e => console.warn(e));
		videoNode.video.muted = true;
		videoNode.video.loop = true;
		videoNode.video.play();
		const videoTexture = this.__graph.node("texture", {
			name: "Video Texture",
			sourceNode: videoNode,
			instantLoad: true,
			update: () => videoNode.video.readyState === 4 ? true : false
		});
		const drawVideoTexture = this.__graph.node("drawTexture", {
			name: "Draw Video Texture",
			transformMatrix: () => {
				const sFactor = this.__getValue(this.scale);
				const offsetX = this.__getValue(this.offsetX);
				const offsetY = this.__getValue(this.offsetY);
				const offsetZ = this.__getValue(this.offsetZ);
				const t1 = Mat4.translate(-videoTexture.width / 2, -videoTexture.height / 2, 0);
				const s = Mat4.scale(sFactor, sFactor, 1);
				const t2 = Mat4.translate(
					offsetX - videoTexture.width / 2 * sFactor,
					offsetY - videoTexture.height / 2 * sFactor,
					offsetZ
				);
				let t = Mat4.multiply(s, t1);
				return Mat4.multiply(t2, t);
			},
			lookatMatrix: () => this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: videoTexture,
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

export {SilverRainFlagNode};
