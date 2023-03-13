// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//           SilverRainVideoPlayerNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainVideoPlayerNode extends SilverRainBaseNode {
	// Input
	src = undefined;
	eventNode = undefined;
	lookatMatrix = Mat4.identity();
	projectionMatrix = Mat4.identity();
	// Global
	// Local
	__graphNode = undefined;
	__videoNode = undefined;
	__margin = 50;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"src",
			"eventNode",
			"lookatMatrix",
			"projectionMatrix"
		]);
    }
	async init() {
		await this.root.importNodes(
			"graph",
			"video",
			"texture",
			"function",
			"drawTexture",
			"canvas",
		);
		this.__graphNode = this.root.node("graph", {
			name: "Graph Node"
		});
		this.__videoNode = this.__graphNode.node("video", {
			name: "Video Node",
			src: this.__getValue(this.src),
		});
		await this.__videoNode.load();
		const videoTexture = this.__graphNode.node("texture", {
			name: "Video Texture",
			sourceNode: this.__videoNode,
			update: () => this.__videoNode.video.played
		});
		let tMatrixVideo, tMatrixButton, playButton;
		const funcNode = this.__graphNode.node("function", {
			code: () => {
				// Video transform
				const maxVideoWidth = Math.min(this.__videoNode.video.videoWidth, this.gl.drawingBufferWidth - this.__margin * 2);
				const maxVideoHeight = Math.min(this.__videoNode.video.videoHeight, this.gl.drawingBufferHeight - this.__margin * 2);
				const sFactor = Math.min(maxVideoWidth / this.__videoNode.width, maxVideoHeight / this.__videoNode.height);
				const t1 = Mat4.translate(-this.__videoNode.width / 2, -this.__videoNode.height / 2, 0);
				const s1 = Mat4.scale(sFactor, sFactor, sFactor);
				tMatrixVideo = Mat4.multiply(s1, t1);
				// Button transform
				tMatrixButton = Mat4.translate(-playButton.width / 2, -playButton.height / 2, -1);
			}
		});
        playButton = this.__graphNode.node("Canvas", {
            name: "Play Button",
            width: 72,
            height: 72,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                // Clear
                this.context.clearRect(0,0,this.width,this.height);
                // Background
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                // Circle
				this.context.globalAlpha = 0.4;
                this.context.fillStyle = "rgb(100,100,100)";
                this.context.beginPath();
                this.context.arc(36, 36, 36, 0, Math.PI * 2);
                this.context.fill();
                // Symbol
                this.context.fillStyle = "rgb(0,0,0)";
                const path = new Path2D("M 25,52 38,44 38,28 25,20 z M 38,44 51,36 51,36 38,28 z");
                this.context.fill(path);
            },
        });
		const eventNode = this.__getValue(this.eventNode);
		const drawVideo = this.__graphNode.node("drawTexture", {
			name: "Draw Video",
			transformMatrix: () => tMatrixVideo,
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: videoTexture,
			eventNode: eventNode
		}).addParentNodes(funcNode);
		const drawButton = this.__graphNode.node("drawTexture", {
			name: "Draw Button",
			transformMatrix: () => tMatrixButton,
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: playButton,
			eventNode: eventNode,
			premultipliedAlpha: true,
			enable: () => this.__videoNode.video.paused || this.__videoNode.video.ended
		}).addParentNodes(funcNode, drawVideo);
		const playOrPause = () => {
			if(this.__videoNode.video.paused) {
				this.__videoNode.video.play();
				return;
			}
			if(this.__videoNode.video.ended) {
				this.__videoNode.video.currentTime = 0;
				this.__videoNode.video.play();
				return;
			}
			this.__videoNode.video.pause();
		}
		eventNode.setCursorStyle({
			object: drawVideo,
			cursor: "pointer"
		})
		eventNode.addEventListener({
			event: "click",
			object: drawVideo,
			phase: "down",
			func: playOrPause
		});

		this.__graphNode.sort();
        return this;
	}
	stop() {
		this.__videoNode.video.pause();
		this.__videoNode.video.currentTime = 0;
		return this;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
			this.__graphNode.draw();
            this.__cleanup();
        }
    }
    draw() {
        this.__graphNode.draw();
		return this;
    }
}

export {SilverRainVideoPlayerNode};
