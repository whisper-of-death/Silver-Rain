// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainGenerateNode
// ----------------------------------------------

import {SilverRainFramebuffer2dNode} from './SilverRainFramebuffer2dNode.js';

class SilverRainGenerateNode extends SilverRainFramebuffer2dNode {
	// Input
	code = undefined;
	instantDraw = false;
	clearColor = undefined;
	uniforms = {};
	// Global
	// Local
    __draw = {
		vSrc: `
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			void main() {
				gl_Position = a_vertex;
				v_texCoord = a_texCoord;
			}
		`,
//         ready: false,
		vertexData: [
			-1,1,
			-1,-1,
			 1,-1,
			 1,1
		],
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
        },
        uniform: {
			dimension: undefined,
			time: undefined,
        },
        buffer: {
            vertex: undefined,
            index: undefined
        },
    }
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"width",
			"height",
			"code",
			"instantDraw",
			"clearColor",
			"uniforms"
		]);
		this.__createProgram();
        this.__init();
		if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
			this.__setup();
			this.draw();
			this.__cleanup();
		}
	}
    __createProgram() {
		const code = this.__getValue(this.code);
		const uniforms = this.__getValue(this.uniforms);
        this.__draw.program = this.root.program(this.__draw.vSrc, code);
        this.__draw.buffer.vertex = this.gl.createBuffer();
        this.__draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.__draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.__draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.__draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.__draw.indexData), this.gl.STATIC_DRAW);
        this.__draw.attribute.vertex = this.gl.getAttribLocation(this.__draw.program, "a_vertex");
        this.__draw.uniform.dimension = this.gl.getUniformLocation(this.__draw.program, "uDimension");
        this.__draw.uniform.time = this.gl.getUniformLocation(this.__draw.program, "uTime");
		for(const name of Object.keys(this.uniforms)) {
			this.__draw.uniform[name] = this.gl.getUniformLocation(this.__draw.program, name);
		}
    }
    draw() {
		const clearColor = this.__getValue(this.clearColor);
		const uniforms = this.__getValue(this.uniforms);
        this.gl.useProgram(this.__draw.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.__draw.buffer.vertex);
        this.gl.vertexAttribPointer(this.__draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.__draw.attribute.vertex);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.__draw.buffer.index);

		if(this.__draw.uniform.dimension) {
			this.gl.uniform2f(this.__draw.uniform.dimension, this.width, this.height);
		}
		if(this.__draw.uniform.time) {
			this.gl.uniform1f(this.__draw.uniform.time, performance.now());
		}

		for(const [name, uniform] of Object.entries(this.uniforms)) {
			if(this.__draw.uniform[name]) {
				switch(uniform.type.toLowerCase()) {
					case "1f":
						this.gl.uniform1f(this.__draw.uniform[name], this.__getValue(uniform.value));
						break;
					case "1fv":
						this.gl.uniform1fv(this.__draw.uniform[name], this.__getValue(uniform.value));
						break;
					case "2fv":
						this.gl.uniform2fv(this.__draw.uniform[name], this.__getValue(uniform.value));
						break;
					case "3fv":
						this.gl.uniform3fv(this.__draw.uniform[name], this.__getValue(uniform.value));
						break;
					case "4fv":
						this.gl.uniform4fv(this.__draw.uniform[name], this.__getValue(uniform.value));
						break;
					default:
						this.__error(`Ivalid type of uniform '${name}'`);
				}
			}
		}

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);
		if(clearColor) {
			this.root.clearColor(clearColor);
		}
        this.__clear();
        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
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

export {SilverRainGenerateNode};
