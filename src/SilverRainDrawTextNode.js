// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainDrawTextNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainDrawTextNode extends SilverRainBaseNode {
	// Input
	fontNode = undefined;
	projectionMatrix = Mat4.identity();
	transformMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	premultipliedAlpha = true;
	instantDraw = false;
	eventNode = undefined;
	text = undefined;
	size = undefined;
	color = [0,0,0,1];
	smoothSdf = 0.1;
	smoothMsdf = 2;
	objectId = undefined;
	framebufferNode = undefined;
	clear = false;
	clearColor = undefined;
	// Global
	// Local
	__width = undefined;
	__height = undefined;
	__vSrc = undefined;
	__fSrcSdf = undefined;
	__fSrcMsdf = undefined;
	__extension = undefined;
	__vertexData = [];
	__textureData = [];
	__minX = undefined;
	__maxX = undefined;
	__minY = undefined;
	__maxY = undefined;
	__ready = false;
	// Static
	static __draw = {
        ready: false,
        program: undefined,
        attribute: {
            vertex: undefined,
            texture: undefined
        },
        uniform: {
            texture: undefined,
			transformMatrix: undefined,
			lookatMatrix: undefined,
			projectionMatrix: undefined,
			color: undefined,
			smooth: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
        },

	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"fontNode",
			"transformMatrix",
			"lookatMatrix",
			"projectionMatrix",
			"premultipliedAlpha",
			"instantDraw",
			"eventNode",
			"text",
			"size",
			"color",
			"smoothSdf",
			"smoothMsdf",
			"objectId",
			"framebufferNode",
			"clear",
			"clearColor"
		]);
		this.__vSrc = `
			precision ${this.root.precision} float;
			uniform mat4 u_transformMatrix;
			uniform mat4 u_projectionMatrix;
			uniform mat4 u_lookatMatrix;
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			uniform vec2 u_texSize;
			void main() {
				gl_Position = u_projectionMatrix * u_lookatMatrix * u_transformMatrix * a_vertex;
				v_texCoord = a_texCoord / u_texSize;
			}
		`,
        this.__fSrcSdf = `
			precision ${this.root.precision} float;
			uniform vec4 u_color;
			uniform float u_smooth;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			void main() {
// 				gl_FragColor = texture2D(u_texture, v_texCoord);
				float dist = texture2D(u_texture, v_texCoord).a;
				float alpha = smoothstep(0.5 - u_smooth, 0.5 + u_smooth, dist);
				gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
				if(gl_FragColor.a < 0.0001) discard;
// 				if(gl_FragColor.a < 0.0001) {
// 					gl_FragColor = vec4(0.9, 0.9, 0.9, 1);
// 				}
			}
		`;
        this.__fSrcMsdf = `
			precision ${this.root.precision} float;
			#extension GL_OES_standard_derivatives : enable
			uniform vec4 u_color;
			uniform float u_smooth;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			uniform vec2 u_texSize;
			float median(float r, float g, float b) {
				return max(min(r, g), min(max(r, g), b));
			}
			float screenPxRange() {
				vec2 unitRange = vec2(u_smooth)/u_texSize;
				vec2 screenTexSize = vec2(1.0)/fwidth(v_texCoord);
				return max(0.5*dot(unitRange, screenTexSize), 1.0);
			}
			void main() {
				vec4 texColor = texture2D(u_texture, v_texCoord);
				float dist = median(texColor.r, texColor.g, texColor.b);
				float pxDist = screenPxRange() * (dist - 0.5);
				float alpha = clamp(pxDist + 0.5, 0.0, 1.0);
				gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
				if(gl_FragColor.a < 0.0001) discard;
			}
		`;
		const fontNode = this.__getValue(this.fontNode);
		if(fontNode.data.info.type === "msdf") {
			this.__extension = this.gl.getExtension('OES_standard_derivatives');
			if(!this.__extension) {
				this.__error(`Unable to load required extension`);
			}
		}
		if(!this.constructor.__draw.ready) {
			this.__createProgram();
		}
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
	__createProgram() {
        const __draw = this.constructor.__draw;
		const fontNode = this.__getValue(this.fontNode);
		let fShaferSrc;
		switch(fontNode.data.info.type) {
			case "sdf":
				fShaferSrc = this.__fSrcSdf;
				break;
			case "msdf":
				fShaferSrc = this.__fSrcMsdf;
				break;
			default:
				this.__error(`Invalid font type`);
		}
        __draw.program = this.root.program(this.__vSrc, fShaferSrc);
        __draw.buffer.vertex = this.gl.createBuffer();
        __draw.buffer.texture = this.gl.createBuffer();
        __draw.attribute.vertex = this.gl.getAttribLocation(__draw.program, "a_vertex");
        __draw.attribute.texture = this.gl.getAttribLocation(__draw.program, "a_texCoord");
        __draw.uniform.texture = this.gl.getUniformLocation(__draw.program, 'u_texture');
        __draw.uniform.transformMatrix = this.gl.getUniformLocation(__draw.program, 'u_transformMatrix');
        __draw.uniform.lookatMatrix = this.gl.getUniformLocation(__draw.program, 'u_lookatMatrix');
        __draw.uniform.projectionMatrix = this.gl.getUniformLocation(__draw.program, 'u_projectionMatrix');
        __draw.uniform.color = this.gl.getUniformLocation(__draw.program, 'u_color');
        __draw.uniform.smooth = this.gl.getUniformLocation(__draw.program, 'u_smooth');
        __draw.uniform.texSize = this.gl.getUniformLocation(__draw.program, 'u_texSize');
        __draw.ready = true;
	}
	__fillData() {
		this.__vertexData = [];
		this.__textureData = [];
		const text = this.__getValue(this.text);
		const size = this.__getValue(this.size);
		const fontNode = this.__getValue(this.fontNode);
// 		const vertexData = [];
// 		const textureData = [];
		let scale = 1;
		if(size > 0) {
			scale = size / fontNode.data.info.size;
		}
		let offsetX = 0;
		const base = fontNode.data.info.size - fontNode.data.info.base;
		this.__minX = Infinity;
		this.__maxX = -Infinity;
		this.__minY = Infinity;
		this.__maxY = -Infinity;
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
				this.__vertexData.push(
					v0.x, v0.y,
					v1.x, v1.y,
					v2.x, v2.y,
					v1.x, v1.y,
					v3.x, v3.y,
					v2.x, v2.y,
				);
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
				this.__textureData.push(
					t0.x, t0.y,
					t1.x, t1.y,
					t2.x, t2.y,
					t1.x, t1.y,
					t3.x, t3.y,
					t2.x, t2.y,
				);
				this.__minX = Math.min(this.__minX, Math.min(v0.x, v1.x, v2.x, v3.x));
				this.__maxX = Math.max(this.__maxX, Math.max(v0.x, v1.x, v2.x, v3.x));
				this.__minY = Math.min(this.__minY, Math.min(v0.y, v1.y, v2.y, v3.y));
				this.__maxY = Math.max(this.__maxY, Math.max(v0.y, v1.y, v2.y, v3.y));
			} else {
				console.warn(`Glyph '${char}' not exist`);
			}
		}
		if(this.__minX == Infinity || this.__maxX == -Infinity || this.__minY == Infinity || this.__maxY == -Infinity) {
			this.__width = 0;
			this.__height = 0;
		} else {
			this.__width = this.__maxX - this.__minX;
			this.__height = this.__maxY - this.__minY;
		}
		this.__ready = true;
	}
	draw() {
        const __draw = this.constructor.__draw;
		const text = this.__getValue(this.text);
		const size = this.__getValue(this.size);
		const color = this.__getValue(this.color);
		const smoothSdf = this.__getValue(this.smoothSdf);
		const smoothMsdf = this.__getValue(this.smoothMsdf);
		const fontNode = this.__getValue(this.fontNode);
		const transformMatrix = this.__getValue(this.transformMatrix);
		const lookatMatrix = this.__getValue(this.lookatMatrix);
		const projectionMatrix = this.__getValue(this.projectionMatrix);
		const premultipliedAlpha = this.__getValue(this.premultipliedAlpha);
		const framebufferNode = this.__getValue(this.framebufferNode);
		const clear = this.__getValue(this.clear);
		const clearColor = this.__getValue(this.clearColor);
//         this.gl.enable(this.gl.BLEND);
		if(premultipliedAlpha) {
			this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		} else {
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		}
		if(clearColor) {
			this.root.clearColor(clearColor);
		}
		if(!this.__ready) {
			this.__fillData();
		}
		this.gl.useProgram(__draw.program);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, fontNode.texture);
		this.gl.uniform1i(__draw.uniform.texture, 0);
		this.gl.uniform4fv(__draw.uniform.color, color);
		this.gl.uniform2f(__draw.uniform.texSize, fontNode.width, fontNode.height);
		switch(fontNode.data.info.type) {
			case "sdf":
// 				console.log("sdf", smoothSdf);
				this.gl.uniform1f(__draw.uniform.smooth, smoothSdf);
				break;
			case "msdf":
// 				console.log("msdf", smoothMsdf);
				this.gl.uniform1f(__draw.uniform.smooth, smoothMsdf);
				break;
		}
		this.gl.uniformMatrix4fv(__draw.uniform.lookatMatrix, false, Mat4.transpose(lookatMatrix));
		this.gl.uniformMatrix4fv(__draw.uniform.projectionMatrix, false, Mat4.transpose(projectionMatrix));
		this.gl.uniformMatrix4fv(__draw.uniform.transformMatrix, false, Mat4.transpose(transformMatrix));

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.__vertexData), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(__draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(__draw.attribute.vertex);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.texture);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.__textureData), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(__draw.attribute.texture, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(__draw.attribute.texture);

		if(framebufferNode) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebufferNode.framebuffer);
			this.gl.viewport(0,0, framebufferNode.width, framebufferNode.height);
			if(clear) {
				framebufferNode.__clear();
			}
			this.gl.drawArrays(this.gl.TRIANGLES, 0, this.__vertexData.length / 2);
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			framebufferNode.generateMipmap();
		} else {
			this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
			if(clear) {
				this.root.clear("color", "depth", "stencil");
			}
			this.gl.drawArrays(this.gl.TRIANGLES, 0, this.__vertexData.length / 2);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}
		this.__ready = false;

		// Store event data
		const eventNode = this.__getValue(this.eventNode);
		if(this.__isNode(eventNode)) {
			const calc = (argVector) => {
				let v = Mat4.multiplyByVector(transformMatrix, argVector);
				v = Mat4.multiplyByVector(lookatMatrix, v);
				v = Mat4.multiplyByVector(projectionMatrix, v);
				v[0] = v[0] / v[3];
				v[1] = v[1] / v[3];
				v[2] = v[2] / v[3];
				v[3] = 1;
				return v;
			}
			const v0 = calc([this.__minX, this.__minY, 0, 1]);
			const v1 = calc([this.__maxX, this.__minY, 0, 1]);
			const v2 = calc([this.__maxX, this.__maxY, 0, 1]);
			const v3 = calc([this.__minX, this.__maxY, 0, 1]);
			const objectId = this.__getValue(this.objectId);
			eventNode.__setData({
				id: objectId ? objectId : this.id,
				data: {
					t1: {
                        v0: v1,
                        v1: v2,
                        v2: v0,
                    },
                    t2: {
                        v0: v3,
                        v1: v0,
                        v2: v2,
					},
				}
			});
		}
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    get width() {
		if(!this.__ready) {
			this.__fillData();
		}
		return this.__width;
	}
    get height() {
		if(!this.__ready) {
			this.__fillData();
		}
		return this.__height;
	}
}

export {SilverRainDrawTextNode};


