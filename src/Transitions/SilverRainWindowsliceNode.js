// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainWindowsliceNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainWindowsliceNode extends SilverRainTransitionNode {
	// Input
	count = 10;
	smoothness = 0.5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"count",
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
			uniform float u_count;
			uniform float u_smoothness;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
                float pr = smoothstep(-u_smoothness, 0.0, v_texCoord.x - u_mix * (1.0 + u_smoothness));
                float s = step(pr, fract(u_count * v_texCoord.x));
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(color1, color2, s);
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
            count: undefined,
            smoothness: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.count = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_count');
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.count, this.__getValue(this.count));
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
    }
}

export {SilverRainWindowsliceNode};
