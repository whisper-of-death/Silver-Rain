// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainDirectionalWarpNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDirectionalWarpNode extends SilverRainTransitionNode {
	// Input
	direction = [-1,1];
	smoothness = 0.5;
	center = [0.5,0.5];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"direction",
			"smoothness",
			"center",
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
			uniform vec2 u_direction;
			uniform float u_smoothness;
			uniform vec2 u_center;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				vec2 v = normalize(u_direction);
				v /= abs(v.x) + abs(v.y);
				float d = v.x * u_center.x + v.y * u_center.y;
				float m = 1.0 - smoothstep(-u_smoothness, 0.0, v.x * v_texCoord.x + v.y * v_texCoord.y - (d - 0.5 + u_mix * (1.0 + u_smoothness)));
				vec4 color1 = texture2D(u_texture1, (v_texCoord - 0.5) * (1.0 - m) + 0.5);
				vec4 color2 = texture2D(u_texture2, (v_texCoord - 0.5) * m + 0.5);
				gl_FragColor = mix(color1, color2, m);
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
            direction: undefined,
            smoothness: undefined,
            center: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.direction = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_direction');
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
        this.constructor.__draw.uniform.center = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_center');
    }
    __setUniform() {
        this.gl.uniform2fv(this.constructor.__draw.uniform.direction, this.__getValue(this.direction));
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
        this.gl.uniform2fv(this.constructor.__draw.uniform.center, this.__getValue(this.center));
    }
}

export {SilverRainDirectionalWarpNode};
