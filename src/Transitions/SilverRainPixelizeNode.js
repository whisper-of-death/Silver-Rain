// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainPixelizeNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainPixelizeNode extends SilverRainTransitionNode {
	// Input
	squaresMin = [20, 20];
	steps = 50;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"squaresMin",
			"steps",
		]);
		this.__createFragmentShaderSource();
        this.__init();
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    __createFragmentShaderSource() {
        this.__fSrc = `
            precision ${this.root.precision} float;
			uniform float u_mix;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			uniform vec2 u_squaresMin;
			uniform float u_steps;

			float d = min(u_mix, 1.0 - u_mix);
			float dist = u_steps > 0.0 ? ceil(d * u_steps) / u_steps : d;
			vec2 squareSize = 2.0 * dist / u_squaresMin;

			void main() {
				vec2 p = dist>0.0 ? (floor(v_texCoord / squareSize) + 0.5) * squareSize : v_texCoord;
				gl_FragColor = mix(texture2D(u_texture1, p), texture2D(u_texture2, p), u_mix);
			}
        `;
	}
    static __draw = {
        ready: false,
		vertexData: [
			-1,1,
			-1,-1,
			 1,-1,
			 1,1
		],
		textureData: [
			0,1,
			0,0,
			1,0,
			1,1
		],
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
            texture: undefined
        },
        uniform: {
            texture1: undefined,
            texture2: undefined,
			dimension: undefined,
            mix: undefined,
            squaresMin: undefined,
            steps: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.squaresMin = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_squaresMin');
        this.constructor.__draw.uniform.steps = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_steps');
    }
    __setUniform() {
        this.gl.uniform2fv(this.constructor.__draw.uniform.squaresMin, this.__getValue(this.squaresMin));
        this.gl.uniform1f(this.constructor.__draw.uniform.steps, this.__getValue(this.steps));
    }
}

export {SilverRainPixelizeNode};
