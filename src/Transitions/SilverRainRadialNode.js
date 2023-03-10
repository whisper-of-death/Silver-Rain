// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainRadialNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainRadialNode extends SilverRainTransitionNode {
	// Input
	smoothness = 1;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"smoothness",
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
			uniform float u_smoothness;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			const float PI = 3.141592653589;
			void main() {
				vec2 rp = v_texCoord * 2.0 - 1.0;
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(
					color1,
					color2,
					smoothstep(0.0, u_smoothness, atan(rp.y,rp.x) + (u_mix - 0.5) * PI * 3.0)
				);
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
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
    }
}

export {SilverRainRadialNode};
