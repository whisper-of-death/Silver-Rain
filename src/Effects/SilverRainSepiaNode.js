// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainSepiaNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainSepiaNode extends SilverRainEffectNode {
	// Input
	value = 0.5;
// 	seed = Math.random();
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"value",
// 			"seed"
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
//             uniform float u_seed;
			varying vec2 v_texCoord;
			void main() {
				vec4 color = texture2D(u_texture, v_texCoord);
				float r = color.r;
				float g = color.g;
				float b = color.b;
				color.r = min(1.0, (r * (1.0 - (0.607 * u_value))) + (g * (0.769 * u_value)) + (b * (0.189 * u_value)));\
				color.g = min(1.0, (r * 0.349 * u_value) + (g * (1.0 - (0.314 * u_value))) + (b * 0.168 * u_value));\
				color.b = min(1.0, (r * 0.272 * u_value) + (g * 0.534 * u_value) + (b * (1.0 - (0.869 * u_value))));\
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
//             seed: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.value = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_value');
//         this.constructor.__draw.uniform.seed = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_seed');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.value, this.__getValue(this.value));
//         this.gl.uniform1f(this.constructor.__draw.uniform.seed, this.__getValue(this.seed));
    }
}

export {SilverRainSepiaNode};
