// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainDraw3dNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4} from './SilverRainMath.js';

class SilverRainDraw3dNode extends SilverRainBaseNode {
	// Input
	objectNode = undefined;
	projectionMatrix = Mat4.identity();
	transformMatrix = Mat4.identity();
	lookatMatrix = Mat4.identity();
	instantDraw = false;
	// Local
	__fSrc = undefined;
	// Static
	static __data = {
		vSrc: `
			uniform mat4 u_transformMatrix;
			uniform mat4 u_projectionMatrix;
			uniform mat4 u_lookatMatrix;
			attribute vec4 a_vertex;
			void main() {
				gl_Position = u_projectionMatrix * u_lookatMatrix * u_transformMatrix * a_vertex;
			}
		`,
        program: undefined,
        attribute: {
            vertex: undefined,
        },
        uniform: {
			diffuseColor: undefined,
			transformMatrix: undefined,
			lookatMatrix: undefined,
			projectionMatrix: undefined,
        },
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"objectNode",
			"transformMatrix",
			"lookatMatrix",
			"projectionMatrix",
			"instantDraw",
		]);
        this.__fSrc = `
			precision ${this.root.precision} float;
			uniform vec4 u_diffuseColor;
			void main() {
				gl_FragColor = u_diffuseColor;
			}
		`;
		if(!this.constructor.__data.program) {
			this.__createProgram();
		}
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
	__createProgram() {
        const __data = this.constructor.__data;
        __data.program = this.root.program(__data.vSrc, this.__fSrc);
        __data.attribute.vertex = this.gl.getAttribLocation(__data.program, "a_vertex");
        __data.uniform.diffuseColor = this.gl.getUniformLocation(__data.program, 'u_diffuseColor');
        __data.uniform.transformMatrix = this.gl.getUniformLocation(__data.program, 'u_transformMatrix');
        __data.uniform.lookatMatrix = this.gl.getUniformLocation(__data.program, 'u_lookatMatrix');
        __data.uniform.projectionMatrix = this.gl.getUniformLocation(__data.program, 'u_projectionMatrix');
	}
	draw() {
        const __data = this.constructor.__data;
		const materials = this.__getValue(this.objectNode).material;
		const transformMatrix = this.__getValue(this.transformMatrix);
		const lookatMatrix = this.__getValue(this.lookatMatrix);
		const projectionMatrix = this.__getValue(this.projectionMatrix);

		this.gl.useProgram(__data.program);
		this.gl.uniformMatrix4fv(__data.uniform.transformMatrix, false, Mat4.transpose(transformMatrix));
		this.gl.uniformMatrix4fv(__data.uniform.lookatMatrix, false, Mat4.transpose(lookatMatrix));
		this.gl.uniformMatrix4fv(__data.uniform.projectionMatrix, false, Mat4.transpose(projectionMatrix));
		for(const [key, material] of materials.entries()) {
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, material.buffer.vertex);
			this.gl.vertexAttribPointer(__data.attribute.vertex, 3, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(__data.attribute.vertex);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
			this.gl.uniform4fv(__data.uniform.diffuseColor, material.diffuseColor);
			this.gl.viewport(0,0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, material.data.vertex.length / 3);
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

export {SilverRainDraw3dNode};


