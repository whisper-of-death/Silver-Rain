// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             SilverRainSliderNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainSliderNode extends SilverRainBaseNode {
	// Input
	images = [];
	transitions = ["transitions/mix"];
	pauseDuration = 5000;
	effectDuration = 1500;
	lookatMatrix = undefined;
	projectionMatrix = undefined;
	offsetX = 0;
	offsetY = 0;
	offsetZ = 0;
	eventNode = undefined;
	maxWidth = 1280;
	maxHeight = 1024;
	margin = 20;
	// Global
	ready = false;
	// Local
	__graph = undefined;
	__currentImage = undefined;
	__nextImage = undefined;
	__currentTransIdx = 0;
	__progressBar = undefined;
	__imageNodes = [];
	__textureNodes = [];
	__drawTextureNode = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
            "images",
            "transitions",
			"pauseDuration",
            "effectDuration",
			"lookatMatrix",
			"projectionMatrix",
			"offsetX",
			"offsetY",
			"offsetZ",
			"eventNode",
			"maxWidth",
			"maxHeight",
			"margin"
		]);
    }
    async __loadImages() {
		const images = this.__getValue(this.images);
		this.__imageNodes.forEach(e => {
			this.__graph.deleteNode(e);
		});
        this.__imageNodes = images.map((e) => {
            return this.__graph.node("image", {
                name: "Image " + e,
                src: e,
				request: {mode: 'cors'},
            });
        });
		let progress = 0;
		this.__progressBar.uniforms.uValue.value = 0;
		if(!this.ready) {
			this.__progressBar.draw();
			this.__drawProgressBar.draw();
		} else {
			this.__progressBar.enable = true;
			this.__drawProgressBar.enable = true;
		}
        await Promise.all(this.__imageNodes.map(
			e => e.load()
			.then(e => {
				this.__progressBar.uniforms.uValue.value = ++progress / this.__imageNodes.length;
				if(!this.ready) {
					this.__progressBar.draw();
					this.__drawProgressBar.draw();
				}
			})
			.catch(e => console.warn(e))
		));
		if(this.ready) {
			this.__progressBar.enable = false;
			this.__drawProgressBar.enable = false;
		}
	}
    __createTextures() {
		this.__textureNodes.forEach(e => {
			e.free();
			this.__graph.deleteNode(e);
		});
        this.__textureNodes = this.__imageNodes.map(e => {
            return this.__graph.node("texture", {
                name: "Texture " + e.name,
                sourceNode: e,
                instantLoad: true,
				update: false,
				cleanup: () => {e.free();}
            });
        });
	}
	__setTransition() {
		const len = this.__getValue(this.transitions).length;
		this.__currentTransIdx++;
		if(this.__currentTransIdx >= len) {
			this.__currentTransIdx = 0;
		}
		this.__transNodes.forEach(e => {e.enable = false;});
		this.__transNodes[this.__currentTransIdx].enable = true;
	}
	async reload() {
		this.__drawTextureNode.enable = false;
		this.__easeNode1.abort();
		await this.__loadImages();
		this.__createTextures();
		this.__graph.sort();
		this.__setTransition();
		this.start();
		this.__drawTextureNode.enable = true;
	}
	async init() {
		this.__currentImage = 0;
		this.__nextImage = 1;
		let __delay = performance.now();
		const eventNode = this.__getValue(this.eventNode);
		const transitions = this.__getValue(this.transitions);
		await this.root.importNodes(...transitions);
		const nodes = [
			"graph",
			"function",
			"image",
			"texture",
			"transformForest",
			"drawTexture",
			"ease",
			"event",
			"canvas",
			"generate",
		];
		await this.root.importNodes(...nodes);
		this.__graph = this.root.node("graph", {
			name: "Graph",
			clear: false,
		});
		this.__progressBar = this.__graph.node("generate", {
			name: "Progress Bar",
			width: 256,
			height:256,
			clearColor: [0,0,0,0],
			uniforms: {
				uValue: {
					type: "1f",
					value: 0
				}
			},
			code: `
				precision mediump float;
				#define LIM 0.001
				#define THICK 0.1
				#define BORDER 0.01
				uniform vec2 uDimension;
				uniform float uTime;
				uniform float uValue;
				const vec4 barColor = vec4(0.,0.,0.,1.);
				vec2 onPixel = 2.0 / uDimension;
				float box(vec2 uv, vec2 edge) {
					return length(max(abs(uv) - edge, 0.0));
				}
				vec4 getLoader(vec2 uv, float aspect) {
					if((box(uv, vec2(1., THICK + onPixel.y)) < LIM && box(uv, vec2(1. - aspect * 2.0 * onPixel.x, THICK - onPixel.y)) > LIM) ||
						(box(uv + vec2(1. - uValue, 0.), vec2(uValue - aspect * 5.0 * onPixel.x, THICK - 3. * onPixel.y)) < LIM)) {
						return barColor;
					}
					discard;
				}
				void main() {
					vec2 uv = (2.0 * gl_FragCoord.xy - uDimension.xy ) / uDimension.y;
					float aspect = uDimension.x / uDimension.y;
					vec4 color = getLoader(uv * 1.2, aspect);
					gl_FragColor = color;
				}
			`,
			instantDraw: false,
			minFilter: "linearmipmaplinear",
			enable: false
		});
		this.__drawProgressBar = this.__graph.node("drawTexture", {
			name: "Draw Progress Bar",
			transformMatrix: () => Mat4.translate(-this.__progressBar.width / 2, -this.__progressBar.height / 2, -10),
			lookatMatrix: this.lookatMatrix,
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: this.__progressBar,
			instantDraw: false,
			enable: false
		});
		await this.__loadImages();
		this.__createTextures();
		const setNextImage = () => {
			this.__nextImage = this.__currentImage + 1;
			if(this.__nextImage >= this.__textureNodes.length) {
				this.__nextImage = 0;
			}
		}
		const gotoPrevImage = () => {
			this.__currentImage--;
			if(this.__currentImage < 0) {
				this.__currentImage = this.__textureNodes.length - 1;
			}
			setNextImage();
			this.__reinitEffect();
		}
		const gotoNextImage = () => {
			this.__currentImage++;
			if(this.__currentImage >= this.__textureNodes.length) {
				this.__currentImage = 0;
			}
			setNextImage();
			this.__reinitEffect();
		}
		this.__easeNode1 = this.__graph.node("ease", {
			name: "Ease1",
			data: [
				{
					count: Infinity,
					children: [
						{
							duration: this.pauseDuration,
							count:1,
							startValue: 0,
							endValue: 0,
							easeFunction: "linear",
						},
						{
							duration: this.effectDuration,
							count:1,
							startValue: 0,
							endValue: 1,
							easeFunction: "easeinoutquad",
							onEndIteration: gotoNextImage
						},
					],
				}
			],
			autoStart: false,
		});
        this.__transNodes = transitions.map((e) => {
            return this.__graph.node(e, {
                name: e,
				textureNode1: () => this.__textureNodes[this.__currentImage],
				textureNode2: () => this.__textureNodes[this.__nextImage],
				update: true,
				mix: () => this.__easeNode1.value,
				enable: false
            }).addParentNodes(...this.__textureNodes);
        });
		this.__drawTextureNode = this.__graph.node("drawTexture", {
			name: "DrawTexture",
			transformMatrix: () => {
				const transNode = this.__transNodes[this.__currentTransIdx];
				const margin = this.__getValue(this.margin);
				const f1 = Math.min(this.__getValue(this.maxWidth) - margin * 2, this.gl.drawingBufferWidth - margin * 2) / transNode.width;
				const f2 = Math.min(this.__getValue(this.maxHeight) - margin * 2, this.gl.drawingBufferHeight - margin * 2) / transNode.height;
				const f = Math.min(f1, f2);
				const t1 = Mat4.translate(-transNode.width / 2, -transNode.height / 2, 0);
				const s1 = Mat4.scale(f, f, 1);
				const t2 = Mat4.translate(this.offsetX, this.offsetY, this.offsetZ);
				return Mat4.multiply(t2, Mat4.multiply(s1, t1));
			},
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: () => this.__transNodes[this.__currentTransIdx],
			eventNode: eventNode,
		}).addParentNodes(...this.__transNodes);
		this.__setTransition();
		const pauseFunc = () => {
			const status = this.__easeNode1.status;
			switch(status) {
				case "run":
					this.__easeNode1.pause();
					break;
				case "pause":
					this.__easeNode1.resume();
					break;
			}
		}
		eventNode.setCursorStyle({
			object: this.__drawTextureNode,
			cursor: "pointer"
		})
		.addEventListener({
			object: this.__drawTextureNode,
			event: "click",
			phase: "down",
			func: pauseFunc
		})
		.addEventListener({
			object: this.__drawTextureNode,
			event: "wheel",
			phase: "down",
			func: (e) => {
				if((performance.now() - __delay) > 500) {
					this.__easeNode1.abort();
					if(e.deltaY > 0) {
						gotoNextImage();
					} else {
						gotoPrevImage();
					}
					this.__easeNode1.start();
					__delay = performance.now();
				}
			}
		})
		.addEventListener({
			object: this.__drawTextureNode,
			event: "touchmove",
			phase: "down",
			func: (e) => {
				if((performance.now() - __delay) > 500) {
					this.__easeNode1.abort();
					if(e.deltaY > 0) {
						gotoNextImage();
					} else {
						gotoPrevImage();
					}
					this.__easeNode1.start();
					__delay = performance.now();
				}
			}
		});
		const pauseButton = this.__graph.node("canvas", {
			name: "Pause Button",
			width: 256,
			height: 64,
			code: function() {
				this.context.font = "32px serif";
				this.context.textAlign = "center";
				this.context.textBaseline = "middle";
				this.context.lineWidth = 1;
				this.context.clearRect(0,0,this.width,this.height);
				this.context.beginPath();
				this.context.rect(2, 2, this.width - 3, this.height - 3);
				this.context.strokeStyle = "black";
				this.context.stroke();
				this.context.fillStyle = "black";
				this.context.fillText("On pause", this.width / 2, this.height / 2);
			},
			instantDraw: true,
			magFilter: "linear",
			minFilter: "linearMipmapLinear",
			update: false
		});
		const drawPauseButton = this.__graph.node("drawTexture", {
			name: "DrawTexture",
			transformMatrix: () => {
				const margin = this.__getValue(this.margin);
				const scale = 0.5;
				const maxWidth = Math.min(this.__getValue(this.maxWidth), this.gl.drawingBufferWidth);
				const maxHeight = Math.min(this.__getValue(this.maxHeight), this.gl.drawingBufferHeight);
				const offsetX = maxWidth / 2 - pauseButton.width / 2 * scale - margin;
				const offsetY = -maxHeight / 2 + pauseButton.height / 2 * scale + margin;
				const t1 = Mat4.translate(-pauseButton.width / 2, -pauseButton.height / 2, 0);
				const s1 = Mat4.scale(scale, scale, 1);
				const t2 = Mat4.translate(offsetX, offsetY, 0);
				return Mat4.multiply(t2, Mat4.multiply(s1, t1));
			},
			lookatMatrix: () => this.__getValue(this.lookatMatrix),
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: pauseButton,
			eventNode: eventNode,
			enable: () => this.__easeNode1.status === "pause" ? true : false
		});
		eventNode.setCursorStyle({
			object: drawPauseButton,
			cursor: "pointer"
		})
		.addEventListener({
			object: drawPauseButton,
			event: "click",
			phase: "down",
			func: (e) => {
				e.stopPropagation();
				pauseFunc();
			}
		});
        this.__graph.sort();
		this.ready = true;
        return this;
	}
	__reinitEffect() {
		this.__transNodes[this.__currentTransIdx].reinit();
	}
    draw() {
        this.__graph.__update();
		return this;
    }
	start() {
		this.__currentImage = 0;
		this.__nextImage = 1;
		this.__reinitEffect();
		this.__easeNode1.start();
		this.enable = true;
		return this;
	}
	stop() {
		this.__easeNode1.abort();
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
}

export {SilverRainSliderNode};
