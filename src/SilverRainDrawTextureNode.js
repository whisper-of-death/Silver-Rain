// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainDrawTextureNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainDrawTextureNode extends SilverRainBaseNode {
	// Input
	textureNode = undefined;
	projectionMatrix = Mat4.identity();
	transformMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	premultipliedAlpha = false;
	instantDraw = false;
	eventNode = undefined;
	objectId = undefined;
	clear = false;
	clearColor = undefined;
	framebufferNode = undefined;
	width = undefined;
	height = undefined;
	// Global
	// Local
	__fSrc = undefined;
	// Static
	static pData = {
		vSrc: `
			uniform mat4 u_transformMatrix;
			uniform mat4 u_projectionMatrix;
			uniform mat4 u_lookatMatrix;
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			void main() {
				gl_Position = u_projectionMatrix * u_lookatMatrix * u_transformMatrix * a_vertex;
				v_texCoord = a_texCoord;
			}
		`,
        ready: false,
        indexData: [0,1,2,3],
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
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },

	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"textureNode",
			"transformMatrix",
			"lookatMatrix",
			"projectionMatrix",
			"premultipliedAlpha",
			"instantDraw",
			"eventNode",
			"objectId",
			"clear",
			"clearColor",
			"framebufferNode",
			"width",
			"height"
		]);
        this.__fSrc = `
			precision ${this.root.precision} float;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			void main() {
				gl_FragColor = texture2D(u_texture, v_texCoord);
			}
		`;
		if(!this.constructor.pData.ready) {
			this.__createProgram();
		}
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
	__createProgram() {
        const pData = this.constructor.pData;
        pData.program = this.root.program(pData.vSrc, this.__fSrc);
        pData.buffer.vertex = this.gl.createBuffer();
        pData.buffer.texture = this.gl.createBuffer();
        pData.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, pData.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(pData.indexData), this.gl.STATIC_DRAW);
        pData.attribute.vertex = this.gl.getAttribLocation(pData.program, "a_vertex");
        pData.attribute.texture = this.gl.getAttribLocation(pData.program, "a_texCoord");
        pData.uniform.texture = this.gl.getUniformLocation(pData.program, 'u_texture');
        pData.uniform.transformMatrix = this.gl.getUniformLocation(pData.program, 'u_transformMatrix');
        pData.uniform.lookatMatrix = this.gl.getUniformLocation(pData.program, 'u_lookatMatrix');
        pData.uniform.projectionMatrix = this.gl.getUniformLocation(pData.program, 'u_projectionMatrix');
        pData.ready = true;
	}
	draw() {
        const pData = this.constructor.pData;
		const textureNode = this.__getValue(this.textureNode);
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
		const input = {
			width: this.__getValue(this.width),
			height: this.__getValue(this.height),
		}
		let width, height, uvWidth, uvHeight;
		if(input.width > 0) {
			width = input.width;
			uvWidth = input.width / textureNode.width;
		} else {
			width = textureNode.width;
			uvWidth = 1;
		}
		if(input.height > 0) {
			height = input.height;
			uvHeight = input.height / textureNode.height;
		} else {
			height = textureNode.height;
			uvHeight = 1;
		}
        const vertexData = [
            0,      0,
            width,  0,
            width,  height,
            0,      height,
        ];

        const textureData = [
            0, 0,
            uvWidth, 0,
            uvWidth, uvHeight,
            0, uvHeight,
        ];
		this.gl.useProgram(pData.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pData.buffer.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexData), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(pData.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(pData.attribute.vertex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pData.buffer.texture);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureData), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(pData.attribute.texture, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(pData.attribute.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textureNode.texture);
        this.gl.uniform1i(pData.uniform.texture, 0);

		this.gl.uniformMatrix4fv(pData.uniform.transformMatrix, false, Mat4.transpose(transformMatrix));
		this.gl.uniformMatrix4fv(pData.uniform.lookatMatrix, false, Mat4.transpose(lookatMatrix));
		this.gl.uniformMatrix4fv(pData.uniform.projectionMatrix, false, Mat4.transpose(projectionMatrix));

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, pData.buffer.index);

		if(clearColor) {
			this.root.clearColor(clearColor);
		}
		if(framebufferNode) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebufferNode.framebuffer);
			this.gl.viewport(0,0, framebufferNode.width, framebufferNode.height);
			if(clear) {
				framebufferNode.__clear();
			}
			this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			framebufferNode.generateMipmap();
		} else {
			this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
			if(clear) {
				this.root.clear("color", "depth", "stencil");
			}
			this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}

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
			const v0 = calc([vertexData[0], vertexData[1], 0, 1]);
			const v1 = calc([vertexData[2], vertexData[3], 0, 1]);
			const v2 = calc([vertexData[4], vertexData[5], 0, 1]);
			const v3 = calc([vertexData[6], vertexData[7], 0, 1]);
			const id = this.objectId ? this.objectId : this.id;
			eventNode.__setData({
                id: id,
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
}

export {SilverRainDrawTextureNode};


