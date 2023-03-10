// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainPinwheelNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainPinwheelNode extends SilverRainTransitionNode {
	// Input
	speed = 2;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
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
			uniform float u_speed;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
                float circPos = atan(v_texCoord.y - 0.5, v_texCoord.x - 0.5) + u_mix * u_speed;
                float modPos = mod(circPos, 3.1415 / 4.0);
                float signed = sign(u_mix - modPos);
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(color2, color1, step(signed, 0.5));
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
            speed: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.speed = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_speed');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.count, this.__getValue(this.speed));
    }
}

export {SilverRainPinwheelNode};
