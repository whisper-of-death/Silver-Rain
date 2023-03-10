// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainNoiseNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainNoiseNode extends SilverRainEffectNode {
	// Input
	value = 0.5;
	seed = Math.random();
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"value",
			"seed"
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
			uniform sampler2D u_texture;
            uniform float u_value;
            uniform float u_seed;
			varying vec2 v_texCoord;
			float rand(vec2 co) {
				return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
			}
			void main() {
				vec4 color = texture2D(u_texture, v_texCoord);
				float randomValue = rand(gl_FragCoord.xy * u_seed);
				float diff = (randomValue - 0.5) * u_value;
				color.r += diff;
				color.g += diff;
				color.b += diff;
				gl_FragColor = color;
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
            texture: undefined,
            value: undefined,
            seed: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.value = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_value');
        this.constructor.__draw.uniform.seed = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_seed');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.value, this.__getValue(this.value));
        this.gl.uniform1f(this.constructor.__draw.uniform.seed, this.__getValue(this.seed));
    }
}

export {SilverRainNoiseNode};
