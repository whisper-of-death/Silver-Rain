// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainRippleNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainRippleNode extends SilverRainTransitionNode {
	// Input
	amplitude = 150;
	speed = 50;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"amplitude",
			"speed",
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
			uniform float u_amplitude;
			uniform float u_speed;
			varying vec2 v_texCoord;
			void main() {
				vec2 dir = v_texCoord - vec2(.5);
				float dist = length(dir);
				vec2 offset = dir * (sin(u_mix * dist * u_amplitude - u_mix * u_speed) + .5) / 30.;
				vec4 color1 = texture2D(u_texture1, v_texCoord + offset);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(color1, color2, smoothstep(0.2, 1.0, u_mix));
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
            amplitude: undefined,
            speed: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.amplitude = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_amplitude');
        this.constructor.__draw.uniform.speed = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_speed');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.amplitude, this.__getValue(this.amplitude));
        this.gl.uniform1f(this.constructor.__draw.uniform.speed, this.__getValue(this.speed));
    }
}

export {SilverRainRippleNode};
