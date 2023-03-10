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
	// Global
	fSrc = undefined;
	// Static
	static pData = {
		vSrc: `
			uniform mat4 u_transformMatrix;
			uniform mat4 u_projectionMatrix;
			uniform mat4 u_lookatMatrix;
			attribute vec4 a_vertex;
			void main() {
				gl_Position = u_projectionMatrix * u_lookatMatrix * u_transformMatrix * a_vertex;
			}
		`,
        ready: false,
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
        this.fSrc = `
			precision ${this.root.precision} float;
			uniform vec4 u_diffuseColor;
			void main() {
				gl_FragColor = u_diffuseColor;
			}
		`;
		if(!this.constructor.pData.ready) {
			this.createProgram();
		}
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
	createProgram() {
        const pData = this.constructor.pData;
        pData.program = this.root.program(pData.vSrc, this.fSrc);
        pData.attribute.vertex = this.gl.getAttribLocation(pData.program, "a_vertex");
        pData.uniform.diffuseColor = this.gl.getUniformLocation(pData.program, 'u_diffuseColor');
        pData.uniform.transformMatrix = this.gl.getUniformLocation(pData.program, 'u_transformMatrix');
        pData.uniform.lookatMatrix = this.gl.getUniformLocation(pData.program, 'u_lookatMatrix');
        pData.uniform.projectionMatrix = this.gl.getUniformLocation(pData.program, 'u_projectionMatrix');
        pData.ready = true;
	}
	draw() {
        const pData = this.constructor.pData;
		const materials = this.__getValue(this.objectNode).material;
		const transformMatrix = this.__getValue(this.transformMatrix);
		const lookatMatrix = this.__getValue(this.lookatMatrix);
		const projectionMatrix = this.__getValue(this.projectionMatrix);

		this.gl.useProgram(pData.program);
		this.gl.uniformMatrix4fv(pData.uniform.transformMatrix, false, Mat4.transpose(transformMatrix));
		this.gl.uniformMatrix4fv(pData.uniform.lookatMatrix, false, Mat4.transpose(lookatMatrix));
		this.gl.uniformMatrix4fv(pData.uniform.projectionMatrix, false, Mat4.transpose(projectionMatrix));
		for(const [key, material] of materials.entries()) {
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, material.buffer.vertex);
			this.gl.vertexAttribPointer(pData.attribute.vertex, 3, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(pData.attribute.vertex);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
			this.gl.uniform4fv(pData.uniform.diffuseColor, material.diffuseColor);
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


