// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainDrawTextObjectNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainDrawTextObjectNode extends SilverRainBaseNode {
	// Input
	textNode = undefined;
	projectionMatrix = Mat4.identity();
	transformMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	premultipliedAlpha = true;
	instantDraw = false;
	eventNode = undefined;
	color = [0,0,0,1];
	smoothSdf = 0.1;
	smoothMsdf = 2;
	objectId = undefined;
	framebufferNode = undefined;
	clear = false;
	clearColor = undefined;
	// Global
	width = undefined;
	height = undefined;
	// Local
	__vSrc = undefined;
	__fSrcSdf = undefined;
	__fSrcMsdf = undefined;
	__extension = undefined;
	// Static
	static __draw = {
        ready: false,
        programSdf: undefined,
        programMsdf: undefined,
        attributeSdf: {
            vertex: undefined,
            texture: undefined
        },
        attributeMsdf: {
            vertex: undefined,
            texture: undefined
        },
        uniformSdf: {
            texture: undefined,
			transformMatrix: undefined,
			lookatMatrix: undefined,
			projectionMatrix: undefined,
			color: undefined,
			smooth: undefined
        },
        uniformMsdf: {
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
			"textNode",
			"transformMatrix",
			"lookatMatrix",
			"projectionMatrix",
			"premultipliedAlpha",
			"instantDraw",
			"eventNode",
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
			uniform mat4 u_transformCharMatrix;
			uniform mat4 u_transformMatrix;
			uniform mat4 u_projectionMatrix;
			uniform mat4 u_lookatMatrix;
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			uniform vec2 u_texSize;
			void main() {
				gl_Position = u_projectionMatrix * u_lookatMatrix * u_transformMatrix * u_transformCharMatrix * a_vertex;
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
				if(gl_FragColor.a < 0.99) discard;
// 				if(gl_FragColor.a < 0.0001) {
// 					gl_FragColor = vec4(0., 0., 0., 1);
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
		const textNode = this.__getValue(this.textNode);
		const fontNode = this.__getValue(textNode.fontNode);
		if(!["sdf", "msdf"].includes(fontNode.data.info.type)) {
			this.__error(`Invalid font type`);
		}
		this.__extension = this.gl.getExtension('OES_standard_derivatives');
		if(!this.__extension) {
			this.__error(`Unable to load required extension`);
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
		const textNode = this.__getValue(this.textNode);
        __draw.buffer.vertex = this.gl.createBuffer();
        __draw.buffer.texture = this.gl.createBuffer();
		// Sdf version
        __draw.programSdf = this.root.program(this.__vSrc, this.__fSrcSdf);
        __draw.attributeSdf.vertex = this.gl.getAttribLocation(__draw.programSdf, "a_vertex");
        __draw.attributeSdf.texture = this.gl.getAttribLocation(__draw.programSdf, "a_texCoord");
        __draw.uniformSdf.texture = this.gl.getUniformLocation(__draw.programSdf, 'u_texture');
        __draw.uniformSdf.transformMatrix = this.gl.getUniformLocation(__draw.programSdf, 'u_transformMatrix');
        __draw.uniformSdf.transformCharMatrix = this.gl.getUniformLocation(__draw.programSdf, 'u_transformCharMatrix');
        __draw.uniformSdf.lookatMatrix = this.gl.getUniformLocation(__draw.programSdf, 'u_lookatMatrix');
        __draw.uniformSdf.projectionMatrix = this.gl.getUniformLocation(__draw.programSdf, 'u_projectionMatrix');
        __draw.uniformSdf.color = this.gl.getUniformLocation(__draw.programSdf, 'u_color');
        __draw.uniformSdf.smooth = this.gl.getUniformLocation(__draw.programSdf, 'u_smooth');
        __draw.uniformSdf.texSize = this.gl.getUniformLocation(__draw.programSdf, 'u_texSize');
		// Msdf version
        __draw.programMsdf = this.root.program(this.__vSrc, this.__fSrcMsdf);
        __draw.attributeMsdf.vertex = this.gl.getAttribLocation(__draw.programMsdf, "a_vertex");
        __draw.attributeMsdf.texture = this.gl.getAttribLocation(__draw.programMsdf, "a_texCoord");
        __draw.uniformMsdf.texture = this.gl.getUniformLocation(__draw.programMsdf, 'u_texture');
        __draw.uniformMsdf.transformMatrix = this.gl.getUniformLocation(__draw.programMsdf, 'u_transformMatrix');
        __draw.uniformMsdf.transformCharMatrix = this.gl.getUniformLocation(__draw.programMsdf, 'u_transformCharMatrix');
        __draw.uniformMsdf.lookatMatrix = this.gl.getUniformLocation(__draw.programMsdf, 'u_lookatMatrix');
        __draw.uniformMsdf.projectionMatrix = this.gl.getUniformLocation(__draw.programMsdf, 'u_projectionMatrix');
        __draw.uniformMsdf.color = this.gl.getUniformLocation(__draw.programMsdf, 'u_color');
        __draw.uniformMsdf.smooth = this.gl.getUniformLocation(__draw.programMsdf, 'u_smooth');
        __draw.uniformMsdf.texSize = this.gl.getUniformLocation(__draw.programMsdf, 'u_texSize');
        __draw.ready = true;
	}
	draw() {
        const __draw = this.constructor.__draw;
		const textNode = this.__getValue(this.textNode);
		if(textNode.data.activeLine === undefined) {
			return;
		}
		const chars = textNode.data.lines[textNode.data.activeLine].chars;
		const fontNode = this.__getValue(textNode.fontNode);
		const color = this.__getValue(this.color);
		const smoothSdf = this.__getValue(this.smoothSdf);
		const smoothMsdf = this.__getValue(this.smoothMsdf);
		const transformMatrix = this.__getValue(this.transformMatrix);
		const lookatMatrix = this.__getValue(this.lookatMatrix);
		const projectionMatrix = this.__getValue(this.projectionMatrix);
		const premultipliedAlpha = this.__getValue(this.premultipliedAlpha);
		const framebufferNode = this.__getValue(this.framebufferNode);
		const clear = this.__getValue(this.clear);
		const clearColor = this.__getValue(this.clearColor);
		if(premultipliedAlpha) {
			this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		} else {
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		}
		if(clearColor) {
			this.root.clearColor(clearColor);
		}
		switch(fontNode.data.info.type) {
			case "sdf":
				this.gl.useProgram(__draw.programSdf);
				this.gl.activeTexture(this.gl.TEXTURE0);
				this.gl.bindTexture(this.gl.TEXTURE_2D, fontNode.texture);
				this.gl.uniform1i(__draw.uniformSdf.texture, 0);
				this.gl.uniform2f(__draw.uniformSdf.texSize, fontNode.width, fontNode.height);
				this.gl.uniform1f(__draw.uniformSdf.smooth, smoothSdf);
				this.gl.uniformMatrix4fv(__draw.uniformSdf.lookatMatrix, false, Mat4.transpose(lookatMatrix));
				this.gl.uniformMatrix4fv(__draw.uniformSdf.projectionMatrix, false, Mat4.transpose(projectionMatrix));
				this.gl.uniformMatrix4fv(__draw.uniformSdf.transformMatrix, false, Mat4.transpose(transformMatrix));
				for(const char of chars) {
					if(char.enable) {
						if(char.color) {
							this.gl.uniform4fv(__draw.uniformSdf.color, char.color);
						} else {
							this.gl.uniform4fv(__draw.uniformSdf.color, color);
						}
						this.gl.uniformMatrix4fv(__draw.uniformSdf.transformCharMatrix, false, Mat4.transpose(char.transformMatrix));
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
						this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(char.vertexData), this.gl.STATIC_DRAW);
						this.gl.vertexAttribPointer(__draw.attributeSdf.vertex, 2, this.gl.FLOAT, false, 0, 0);
						this.gl.enableVertexAttribArray(__draw.attributeSdf.vertex);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.texture);
						this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(char.textureData), this.gl.STATIC_DRAW);
						this.gl.vertexAttribPointer(__draw.attributeSdf.texture, 2, this.gl.FLOAT, false, 0, 0);
						this.gl.enableVertexAttribArray(__draw.attributeSdf.texture);
						if(framebufferNode) {
							this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebufferNode.framebuffer);
							this.gl.viewport(0,0, framebufferNode.width, framebufferNode.height);
							if(clear) {
								framebufferNode.__clear();
							}
							this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
							this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
							framebufferNode.generateMipmap();
						} else {
							this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
							if(clear) {
								this.root.clear("color", "depth", "stencil");
							}
							this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
						}
					}
				}
				this.gl.bindTexture(this.gl.TEXTURE_2D, null);
				break;
			case "msdf":
				this.gl.useProgram(__draw.programMsdf);
				this.gl.activeTexture(this.gl.TEXTURE0);
				this.gl.bindTexture(this.gl.TEXTURE_2D, fontNode.texture);
				this.gl.uniform1i(__draw.uniformMsdf.texture, 0);
				this.gl.uniform2f(__draw.uniformMsdf.texSize, fontNode.width, fontNode.height);
				this.gl.uniform1f(__draw.uniformMsdf.smooth, smoothMsdf);
				this.gl.uniformMatrix4fv(__draw.uniformMsdf.lookatMatrix, false, Mat4.transpose(lookatMatrix));
				this.gl.uniformMatrix4fv(__draw.uniformMsdf.projectionMatrix, false, Mat4.transpose(projectionMatrix));
				this.gl.uniformMatrix4fv(__draw.uniformMsdf.transformMatrix, false, Mat4.transpose(transformMatrix));
				for(const char of chars) {
					if(char.enable) {
						if(char.color) {
							this.gl.uniform4fv(__draw.uniformMsdf.color, char.color);
						} else {
							this.gl.uniform4fv(__draw.uniformMsdf.color, color);
						}
						this.gl.uniformMatrix4fv(__draw.uniformMsdf.transformCharMatrix, false, Mat4.transpose(char.transformMatrix));
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
						this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(char.vertexData), this.gl.STATIC_DRAW);
						this.gl.vertexAttribPointer(__draw.attributeMsdf.vertex, 2, this.gl.FLOAT, false, 0, 0);
						this.gl.enableVertexAttribArray(__draw.attributeMsdf.vertex);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.texture);
						this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(char.textureData), this.gl.STATIC_DRAW);
						this.gl.vertexAttribPointer(__draw.attributeMsdf.texture, 2, this.gl.FLOAT, false, 0, 0);
						this.gl.enableVertexAttribArray(__draw.attributeMsdf.texture);
						if(framebufferNode) {
							this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebufferNode.framebuffer);
							this.gl.viewport(0,0, framebufferNode.width, framebufferNode.height);
							if(clear) {
								framebufferNode.__clear();
							}
							this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
							this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
							framebufferNode.generateMipmap();
						} else {
							this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
							if(clear) {
								this.root.clear("color", "depth", "stencil");
							}
							this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
						}
					}
				}
				this.gl.bindTexture(this.gl.TEXTURE_2D, null);
				break;
		}
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainDrawTextObjectNode};


