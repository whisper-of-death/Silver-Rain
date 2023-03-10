// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              SilverRainMenuNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainMenuNode extends SilverRainBaseNode {
	// Input
	activeItem = 0;
	items = undefined;
	lookatMatrix = undefined;
	projectionMatrix = undefined;
	offsetX = 0;
	offsetY = 0;
	offsetZ = 0;
	fontImageSrc = undefined;
	fontJsonSrc = undefined;
	eventNode = undefined;
	// Global
	// Local
	__graph = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"activeItem",
			"items",
			"lookatMatrix",
			"projectionMatrix",
			"offsetX",
			"offsetY",
			"offsetZ",
			"fontImageSrc",
			"fontJsonSrc",
			"eventNode"
		]);
    }
	async init() {
		const items = this.__getValue(this.items);
		const eventNode = this.__getValue(this.eventNode);
		const nodes = [
			"graph",
			"generate",
			"function",
			"drawText",
			"sdfFont",
			"drawTexture",
			"framebuffer",
			"image",
			"texture",
			"transformForest",
			"event",
			"effects/adjustment"
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
		const roundedBox = this.__graphNode.node("generate", {
			name: "Rounded Box",
			width: 256,
			height:64,
			clearColor: [0,0,0,0],
			code: `
				precision mediump float;
				uniform vec2 uDimension;
				uniform float uTime;
				bool roundedRect(in vec2 uv, in vec2 center, in vec2 size, in float radius) {
					vec2 q = abs(uv) - size + radius;
					float v = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
					return (v < 0.0) ? true : false;
				}
				void main() {
					vec2 pos = gl_FragCoord.xy / uDimension;
					float aspect = uDimension.x / uDimension.y;
					vec2 uv = 2.0 * pos - 1.0;
					vec2 onePixel = 2.0 / uDimension;
					const float t = 2.0;
					vec2 sValue = vec2(1.0 - t * onePixel);
					vec2 eValue = vec2(sValue - t * onePixel);
					vec4 fgColor = vec4(0.3, 0.3, 0.3, 1.0);
					bool f1 = roundedRect(uv, vec2(0.0, 0.0), sValue, 0.15);
					bool f2 = roundedRect(uv, vec2(0.0, 0.0), eValue, 0.15);
					if(f1^^f2 == true) {
						gl_FragColor = fgColor;
					} else {
						discard;
					}
				}
			`,
			instantDraw: true,
			minFilter: "linearmipmaplinear",
			update: false,
		});
		const bgColor = this.__graphNode.node("generate", {
			name: "Background Color",
			width: 320,
			height: 80 * items.length,
			code: `
				precision mediump float;
				uniform vec2 uDimension;
				uniform float uTime;

				void main() {
					vec2 uv = gl_FragCoord.xy / uDimension; 	// 0.0 ... 1.0;

					vec2 p[4];
					float t0 = uTime / 2000.0;
					float t1 = (uTime + 1300.0) / 2300.0;
					float t2 = (uTime + 800.0) / 2600.0;
					float t3 = (uTime - 3300.0) / 1700.0;
					p[0] = vec2(cos(t0), sin(t1)) * cos(t3) * 0.45 + vec2(0.5, 0.5);
					p[1] = vec2(sin(t1), cos(t3)) * sin(t2) * 0.45 + vec2(0.5, 0.5);
					p[2] = vec2(cos(t2), sin(t2)) * cos(t1) * 0.45 + vec2(0.5, 0.5);
					p[3] = vec2(sin(t3), cos(t0)) * sin(t0) * 0.45 + vec2(0.5, 0.5);

					vec3 c[4];
					c[0] = vec3(0.4, 0.4, 0.4);
					c[1] = vec3(0.5, 0.5, 0.5);
					c[2] = vec3(0.8, 0.8, 0.8);
					c[3] = vec3(0.9, 0.9, 0.9);

					const float blend = 2.0;
					vec3 sum = vec3(0.0);
					float valence = 0.0;

					for(int i = 0; i < 4; i++) {
						float distance = length(uv - p[i]);
						float w = 1.0 / pow(distance, blend);
						sum += w * c[i];
						valence += w;
					}
					sum /= valence;
					sum = pow(sum, vec3(1.0 / 2.2));

					gl_FragColor = vec4(sum.xyz, 1.0);
				}
			`,
			instantDraw: true,
// 			update: false
		});
		const frameBuffer = this.__graphNode.node("framebuffer", {
			name: "Framebuffer",
			width: 256,
			height: 64,
			minFilter: "linearmipmaplinear"
		});
		const effectNode = this.__graphNode.node("effects/adjustment", {
			name: "Effect Node",
			textureNode: roundedBox,
			alpha: () => 0.7 + Math.sin(performance.now() / 250) * 0.3,
			instantDraw: true,
			minFilter: "linearmipmaplinear"
		});
		let projectionMatrixFramebuffer;
		const drawIntoFramebuffer = this.root.node("drawTexture", {
			name: "Draw Into Framebuffer",
			transformMatrix: () => Mat4.translate(-roundedBox.width / 2, -roundedBox.height / 2, 1),
			lookatMatrix: this.lookatMatrix,
			projectionMatrix: () => projectionMatrixFramebuffer,
			framebufferNode: frameBuffer,
			clear: true,
			clearColor: [0,0,0,0],
		});
		const drawTextIntoFramebuffer = this.root.node("drawText", {
			name: "Draw Text Into Framebuffer",
			transformMatrix: function() {return Mat4.translate(-this.width / 2, -12, 0);},
			lookatMatrix: this.lookatMatrix,
			projectionMatrix: () => projectionMatrixFramebuffer,
			fontNode: sdfFont,
			color:[0,0,0,1],
			smoothSdf: 0.05,
			smoothMsdf: 5,
			size: 42,
			framebufferNode: frameBuffer,
		});
		let sFactor;
		sFactor = 0.5;
		const forestData = {
			t2: {
				transformMatrix: () => Mat4.translate(
					this.__getValue(this.offsetX) + bgColor.width / 2 * sFactor,
					this.__getValue(this.offsetY) - bgColor.height / 2 * sFactor,
					this.__getValue(this.offsetZ)
				),
				items: {
					transformMatrix: () => {
						return Mat4.translate(0, items.length * 60 * sFactor / 2, 0);
					},
				},
				bg: {
					transformMatrix: Mat4.scale(sFactor, sFactor, sFactor),
					t1: {
						transformMatrix: Mat4.translate(-bgColor.width / 2, -bgColor.height / 2, 1),
					}
				}
			}
		};
		for(let i = 0; i < items.length; i++) {
			forestData.t2.items["item" + i] = {
				transformMatrix: Mat4.translate(0, -70 * sFactor * i,0),
				s1: {
					transformMatrix: Mat4.scale(sFactor, sFactor, sFactor),
					t1: {
						transformMatrix: Mat4.translate(-frameBuffer.width / 2,-frameBuffer.height / 2, 0),
					}
				}
			};
		}
		for(let i = 0; i < items.length; i++) {
			const item = items[i];
			const name = "item" + i;
			eventNode.setCursorStyle({
				id: name,
				cursor: "pointer"
			});
			if(Reflect.has(item, "onclick") && this.__getType(item.onclick) === "function") {
				eventNode
				.addEventListener({
					id: name,
					event: "click",
					phase: "down",
					func: item.onclick
				})
				.addEventListener({
					id: name,
					event: "touchclick",
					phase: "down",
					func: item.onclick
				});
			}
		}
		const hWidth = frameBuffer.width / 2 ;
		const hHeight = frameBuffer.height / 2;
		projectionMatrixFramebuffer = Mat4.orthoLeft({
			left: -hWidth,
			right: hWidth,
			bottom: -hHeight,
			top: hHeight,
			near: 1,
			far: 3000
		});
		const tForest = this.__graphNode.node("transformForest", {
			name: "Transform Forest",
			forest: forestData,
			instantCalc: true
		});
		const drawFramebuffer = this.root.node("drawTexture", {
			name: "Draw Framebuffer",
			lookatMatrix: this.lookatMatrix,
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: frameBuffer,
			eventNode: eventNode,
		});
		const bgEffectNode = this.__graphNode.node("effects/adjustment", {
			name: "Background Effect Node",
			textureNode: bgColor,
			alpha: 0.7,
			instantDraw: true,
		});
		const drawTextureBg = this.__graphNode.node("drawTexture", {
			name: "Draw Background Texture",
			transformMatrix: () => tForest.forest.t2.bg.t1.worldMatrix,
			lookatMatrix: () => this.lookatMatrix,
			projectionMatrix: () => this.__getValue(this.projectionMatrix),
			textureNode: bgEffectNode,
			eventNode: eventNode
		});
		const funcNode2 = this.__graphNode.node("function", {
			name: "Function Node 2",
			code: () => {
				const activeItem = this.__getValue(this.activeItem);
				for(let i = 0; i < items.length; i++) {
					const name = "item" + i;
					if(activeItem == i) {
						drawIntoFramebuffer.textureNode = effectNode;
					} else {
						drawIntoFramebuffer.textureNode = roundedBox;
					}
					drawIntoFramebuffer.draw();
					drawTextIntoFramebuffer.text = items[i].text;
					drawTextIntoFramebuffer.draw();
					drawFramebuffer.transformMatrix = tForest.forest.t2.items[name].s1.t1.worldMatrix;
					drawFramebuffer.objectId = name;
					drawFramebuffer.draw();
				}
			},
		}).addParentNodes(tForest, drawTextureBg);
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

export {SilverRainMenuNode};
