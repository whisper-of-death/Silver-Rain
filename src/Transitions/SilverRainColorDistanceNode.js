// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//          SilverRainColorDistanceNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainColorDistanceNode extends SilverRainTransitionNode {
	// Input
	power = 5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"power",
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
			uniform float u_power;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				float m = step(distance(color1, color2), u_mix);
				vec4 color = mix(color1, color2, m);
				gl_FragColor = mix(color, color2, pow(u_mix, u_power));
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
            power: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.power = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_power');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.power, this.__getValue(this.power));
    }
}

export {SilverRainColorDistanceNode};
