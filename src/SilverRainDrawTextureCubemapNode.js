// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainDrawTextureCubemapNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainDrawTextureCubemapNode extends SilverRainBaseNode {
	// Input
	textureNode = undefined;
	premultipliedAlpha = false;
	instantDraw = false;
	// Local
	__fSrc = undefined;
	// Static
	static __draw = {
		vSrc: `
            attribute vec4 a_vertex;
            attribute vec3 a_texCoord;
            varying vec3 v_texCoord;
            void main() {
                gl_Position = a_vertex;
                v_texCoord = a_texCoord;
            }
		`,
        ready: false,
        vertexData: [
            // x+
            0,   -0.33, 0,
            0.5,  0.33, 0,
            0,    0.33, 0,
            0,   -0.33, 0,
            0.5, -0.33, 0,
            0.5,  0.33, 0,
            // x-
            -1,   -0.33, 0,
            -0.5,  0.33, 0,
            -1,    0.33, 0,
            -1,   -0.33, 0,
            -0.5, -0.33, 0,
            -0.5,  0.33, 0,
            // y+
            -0.5,  0.33, 0,
            0,     1,    0,
            -0.5,  1,    0,
            -0.5,  0.33, 0,
            0,     0.33, 0,
            0,     1,    0,
            // y-
            -0.5, -1,    0,
            0,    -0.33, 0,
            -0.5, -0.33, 0,
            -0.5, -1,    0,
            0,    -1,    0,
            0,    -0.33, 0,
            // z+
            -0.5, -0.33, 0,
            0,     0.33, 0,
            -0.5,  0.33, 0,
            -0.5, -0.33, 0,
            0,    -0.33, 0,
            0,     0.33, 0,
            // z-
            0.5,  -0.33, 0,
            1,     0.33, 0,
            0.5,   0.33, 0,
            0.5,  -0.33, 0,
            1,    -0.33, 0,
            1,     0.33, 0
        ],
        textureData: [
            // x+
            1,-1,1,
            1,1,-1,
            1,1,1,
            1,-1,1,
            1,-1,-1,
            1,1,-1,
            // x-
            -1,-1,-1,
            -1,1,1,
            -1,1,-1,
            -1,-1,-1,
            -1,-1,1,
            -1,1,1,
            // y+
            -1,1,1,
            1,1,-1,
            -1,1,-1,
            -1,1,1,
            1,1,1,
            1,1,-1,
            // y-
            -1,-1,-1,
            1,-1,1,
            -1,-1,1,
            -1,-1,-1,
            1,-1,-1,
            1,-1,1,
            // z+
            -1,-1,1,
            1,1,1,
            -1,1,1,
            -1,-1,1,
            1,-1,1,
            1,1,1,
            // z-
            1,-1,-1,
            -1,1,-1,
            1,1,-1,
            1,-1,-1,
            -1,-1,-1,
            -1,1,-1
        ],
        program: undefined,
        attribute: {
            vertex: undefined,
            texture: undefined
        },
        uniform: {
            texture: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
        },
        countTriangles: undefined
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"textureNode",
			"premultipliedAlpha",
			"instantDraw",
		]);
        this.__fSrc = `
            precision ${this.root.precision} float;
            uniform samplerCube u_texture;
            varying vec3 v_texCoord;
            void main() {
                gl_FragColor = textureCube(u_texture, v_texCoord);
            }
		`;
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
        __draw.program = this.root.program(__draw.vSrc, this.__fSrc);
        __draw.buffer.vertex = this.gl.createBuffer();
        __draw.buffer.texture = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(__draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.texture);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(__draw.textureData), this.gl.STATIC_DRAW);
        __draw.attribute.vertex = this.gl.getAttribLocation(__draw.program, "a_vertex");
        __draw.attribute.texture = this.gl.getAttribLocation(__draw.program, "a_texCoord");
        __draw.uniform.texture = this.gl.getUniformLocation(__draw.program, 'u_texture');
        __draw.countTriangles = __draw.vertexData.length / 3;
        __draw.ready = true;
	}
	draw() {
        const __draw = this.constructor.__draw;
		const textureNode = this.__getValue(this.textureNode);
		const premultipliedAlpha = this.__getValue(this.premultipliedAlpha);
		if(premultipliedAlpha) {
			this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		} else {
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		}
		this.gl.useProgram(__draw.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
        this.gl.vertexAttribPointer(__draw.attribute.vertex, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(__draw.attribute.vertex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.texture);
        this.gl.vertexAttribPointer(__draw.attribute.texture, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(__draw.attribute.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, textureNode.texture);
        this.gl.uniform1i(__draw.uniform.texture, 0);

		this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, __draw.countTriangles);
		this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
		return this;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainDrawTextureCubemapNode};
