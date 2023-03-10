// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainTransitionNode
// ----------------------------------------------

import {SilverRainFramebuffer2dNode} from './SilverRainFramebuffer2dNode.js';

class SilverRainTransitionNode extends SilverRainFramebuffer2dNode {
	// Global
	textureNode1 = undefined;
	textureNode2 = undefined;
	mix = 0;
	instantDraw = undefined;
	// Local
	__vSrc = `
		attribute vec4 a_vertex;
		attribute vec2 a_texCoord;
		varying vec2 v_texCoord;
		void main() {
			gl_Position = a_vertex;
			v_texCoord = a_texCoord;
		}
	`;
	__fSrc = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"textureNode1",
			"textureNode2",
			"mix",
			"instantDraw",
		]);
    }
    /*
    __init() {
		const textureNode1 = this.__getValue(this.textureNode1);
		const textureNode2 = this.__getValue(this.textureNode2);
		this.width = Math.max(textureNode1.width, textureNode2.width);
        this.height = Math.max(textureNode1.height, textureNode2.height);
        super.__init();
    }
    reinit() {
		const textureNode1 = this.__getValue(this.textureNode1);
		const textureNode2 = this.__getValue(this.textureNode2);
		const newWidth = Math.max(textureNode1.width, textureNode2.width);
        const newHeight = Math.max(textureNode1.height, textureNode2.height);
        if(newWidth != this.width || newHeight != this.height) {
            this.width = newWidth;
            this.height = newHeight;
            super.reinit();
        }
    }
    */
    __init() {
		const textureNode1 = this.__getValue(this.textureNode1);
		this.width = textureNode1.width;
		this.height = textureNode1.height;
        super.__init();
    }
    reinit() {
		const textureNode1 = this.__getValue(this.textureNode1);
		if(this.width !== textureNode1.width || this.height !== textureNode1.height) {
			this.width = textureNode1.width;
			this.height = textureNode1.height;
			super.reinit();
		}
	}
    __createProgram() {
        const draw = this.constructor.__draw;
        draw.program = this.root.program(this.__vSrc, this.__fSrc);
        draw.buffer.vertex = this.gl.createBuffer();
        draw.buffer.texture = this.gl.createBuffer();
        draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.texture);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.textureData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(draw.indexData), this.gl.STATIC_DRAW);
        draw.attribute.vertex = this.gl.getAttribLocation(draw.program, "a_vertex");
        draw.attribute.texture = this.gl.getAttribLocation(draw.program, "a_texCoord");
        draw.uniform.texture1 = this.gl.getUniformLocation(draw.program, 'u_texture1');
        draw.uniform.texture2 = this.gl.getUniformLocation(draw.program, 'u_texture2');
        draw.uniform.dimension = this.gl.getUniformLocation(draw.program, 'u_dimension');
        draw.uniform.mix = this.gl.getUniformLocation(draw.program, 'u_mix');
		if(Reflect.has(this, "__getUniformLocation")) {
			this.__getUniformLocation();
		}
        draw.ready = true;
    }
    draw() {
        const draw = this.constructor.__draw;
        if(!draw.ready) {
            this.__createProgram();
        }
        this.gl.useProgram(draw.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
        this.gl.vertexAttribPointer(draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.vertex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.texture);
        this.gl.vertexAttribPointer(draw.attribute.texture, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.texture);

		this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.__getValue(this.textureNode1).texture);
        this.gl.uniform1i(draw.uniform.texture1, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.__getValue(this.textureNode2).texture);
        this.gl.uniform1i(draw.uniform.texture2, 1);

		if(draw.uniform.dimension) {
			this.gl.uniform2fv(draw.uniform.dimension, [this.width, this.height]);
		}
		this.gl.uniform1f(draw.uniform.mix, this.__getValue(this.mix));

		if(Reflect.has(this, "__setUniform")) {
			this.__setUniform();
		}

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);
        this.__clear();
        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.generateMipmap();
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainTransitionNode};
