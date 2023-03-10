// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainDreamyNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDreamyNode extends SilverRainTransitionNode {
	// Input
	strength = 0.03;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"strength",
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
			uniform float u_strength;
			varying vec2 v_texCoord;
			const float PI = 3.141592653589793;
			vec2 offset(float progress, float x, float theta) {
				float phase = progress*progress + progress + theta;
				float shifty = u_strength*progress*cos(10.0*(progress+x));
				return vec2(0, shifty);
			}
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord + offset(u_mix, v_texCoord.x, 0.0));
				vec4 color2 = texture2D(u_texture2, v_texCoord + offset(1.0-u_mix, v_texCoord.x, PI));
				gl_FragColor = mix(color1, color2, u_mix);
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
            strength: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.strength = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_strength');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.strength, this.__getValue(this.strength));
    }
}

export {SilverRainDreamyNode};
