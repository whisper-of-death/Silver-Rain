// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainCircleOpenNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainCircleOpenNode extends SilverRainTransitionNode {
	// Input
	smoothness = 0.3;
	opening = true;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"smoothness",
			"opening",
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
			uniform float u_smoothness;
			uniform bool u_opening;
			varying vec2 v_texCoord;
			const vec2 center = vec2(0.5, 0.5);
			const float SQRT_2 = 1.414213562373;
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				float x = u_opening ? u_mix : 1.-u_mix;
				float m = smoothstep(-u_smoothness, 0.0, SQRT_2*distance(center, v_texCoord) - x*(1.+u_smoothness));
				gl_FragColor = mix(color1, color2, u_opening ? 1.-m : m);
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
            smoothness: undefined,
            opening: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
        this.constructor.__draw.uniform.opening = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_opening');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
        this.gl.uniform1i(this.constructor.__draw.uniform.opening, this.__getValue(this.opening));
    }
}

export {SilverRainCircleOpenNode};
