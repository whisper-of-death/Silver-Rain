// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainLinearBlurNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainLinearBlurNode extends SilverRainTransitionNode {
	// Input
	intensity = 0.02;
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
				const int passes = 6;
				vec4 color1 = vec4(0.0);
				vec4 color2 = vec4(0.0);
				float disp = u_intensity*(0.5-distance(0.5, u_mix));
				for (int xi=0; xi<passes; xi++) {
					float x = float(xi) / float(passes) - 0.5;
					for (int yi=0; yi<passes; yi++) {
						float y = float(yi) / float(passes) - 0.5;
						vec2 v = vec2(x,y);
						float d = disp;
						color1 += texture2D(u_texture1, v_texCoord + d*v);
						color2 += texture2D(u_texture2, v_texCoord + d*v);
					}
				}
				color1 /= float(passes*passes);
				color2 /= float(passes*passes);
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
            intensity: undefined,
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

export {SilverRainLinearBlurNode};
