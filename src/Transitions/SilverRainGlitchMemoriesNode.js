// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainGlitchMemoriesNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainGlitchMemoriesNode extends SilverRainTransitionNode {
	// Input
	intensity = 0.4;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"intensity",
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
			uniform float u_speed;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			uniform float u_intensity;
			varying vec2 v_texCoord;

			void main() {
				vec2 block = floor(v_texCoord / vec2(16));
				vec2 uv_noise = block / vec2(64);
				uv_noise += floor(vec2(u_mix) * vec2(1200.0, 3500.0)) / vec2(64);
				vec2 dist = u_mix > 0.0 ? (fract(uv_noise) - 0.5) * 0.3 *(1.0 -u_mix) : vec2(0.0);
				vec2 uv = v_texCoord + dist * u_intensity;
				vec4 color1 = texture2D(u_texture1, uv);
				vec4 color2 = texture2D(u_texture2, uv);
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
			intensity: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.intensity = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_intensity');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.intensity, this.__getValue(this.intensity));
    }
}

export {SilverRainGlitchMemoriesNode};
