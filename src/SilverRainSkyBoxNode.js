// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainSkyBoxNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainSkyBoxNode extends SilverRainBaseNode {
	// Input
	textureNode = undefined;
	premultipliedAlpha = false;
	instantDraw = false;
	projectionMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	// Local
	__fSrc = undefined;
	// Static
	static __draw = {
		vSrc: `
			attribute vec4 a_vertex;
            varying vec4 v_texCoord;
            void main() {
				gl_Position = a_vertex;
				gl_Position.z = 0.99;
                v_texCoord = a_vertex;
            }
		`,
		vertexData: [
			-1, -1,
			 1, -1,
			-1,  1,
			-1,  1,
			 1, -1,
			 1,  1,
		],
        program: undefined,
        attribute: {
            vertex: undefined,
        },
        uniform: {
            texture: undefined,
			matrix: undefined,
// 			projectionMatrix: undefined
        },
        buffer: {
            vertex: undefined,
//             index: undefined,
        },
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"textureNode",
			"premultipliedAlpha",
			"instantDraw",
			"projectionMatrix",
			"lookatMatrix"
		]);
        this.__fSrc = `
            precision ${this.root.precision} float;
            uniform samplerCube u_texture;
			uniform mat4 u_matrix;
            varying vec4 v_texCoord;
            void main() {
				vec4 t = u_matrix * v_texCoord;
                gl_FragColor = textureCube(u_texture, normalize(t.xyz/t.w));
//                 gl_FragColor = textureCube(u_texture, t.xyz);
            }
		`;
		if(!this.constructor.__draw.program) {
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
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(__draw.vertexData), this.gl.STATIC_DRAW);
        __draw.attribute.vertex = this.gl.getAttribLocation(__draw.program, "a_vertex");
        __draw.uniform.texture = this.gl.getUniformLocation(__draw.program, 'u_texture');
        __draw.uniform.matrix = this.gl.getUniformLocation(__draw.program, 'u_matrix');
	}
	draw() {
        const __draw = this.constructor.__draw;
		const input = {
			textureNode: this.__getValue(this.textureNode),
			premultipliedAlpha: this.__getValue(this.premultipliedAlpha),
			lookatMatrix: this.__getValue(this.lookatMatrix),
			projectionMatrix: this.__getValue(this.projectionMatrix),
		}
		if(input.premultipliedAlpha) {
			this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		} else {
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		}
		this.gl.useProgram(__draw.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, __draw.buffer.vertex);
        this.gl.vertexAttribPointer(__draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(__draw.attribute.vertex);

		const iMatrix = Mat4.inverse(input.lookatMatrix);
 		iMatrix[3] = 0;
 		iMatrix[7] = 0;
		iMatrix[11] = 0;
		let matrix = Mat4.multiply(input.projectionMatrix, iMatrix);
		matrix = Mat4.inverse(matrix);
		this.gl.uniformMatrix4fv(__draw.uniform.matrix, false, Mat4.transpose(matrix));

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, input.textureNode.texture);
        this.gl.uniform1i(__draw.uniform.texture, 0);

		this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
// 		this.gl.disable(this.gl.DEPTH_TEST);
// 		this.gl.disable(this.gl.CULL_FACE);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
// 		this.gl.enable(this.gl.CULL_FACE);
// 		this.gl.enable(this.gl.DEPTH_TEST);
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

export {SilverRainSkyBoxNode};
