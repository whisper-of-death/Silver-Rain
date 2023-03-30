// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainSquaresWireNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainSquaresWireNode extends SilverRainTransitionNode {
	// Input
	size = [10, 10];
	direction = [1, -0.5];
	smoothness = 1.6;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"size",
			"direction",
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
			uniform vec2 u_size;
			uniform vec2 u_direction;
			uniform float u_smoothness;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			const vec2 center = vec2(0.5, 0.5);
			void main() {
				vec2 v = normalize(u_direction);
				v /= abs(v.x)+abs(v.y);
				float d = v.x * center.x + v.y * center.y;
				float pr = smoothstep(-u_smoothness, 0.0, v.x * v_texCoord.x + v.y * v_texCoord.y - (d-0.5+u_mix*(1.+u_smoothness)));
				vec2 squarep = fract(v_texCoord*u_size);
				vec2 squaremin = vec2(pr/2.0);
				vec2 squaremax = vec2(1.0 - pr/2.0);
				float a = (1.0 - step(u_mix, 0.0)) * step(squaremin.x, squarep.x) * step(squaremin.y, squarep.y) * step(squarep.x, squaremax.x) * step(squarep.y, squaremax.y);
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(color1, color2, a);
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
            size: undefined,
            direction: undefined,
            smoothness: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
        this.constructor.__draw.uniform.direction = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_direction');
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
    }
    __setUniform() {
        this.gl.uniform2fv(this.constructor.__draw.uniform.size, this.__getValue(this.size));
        this.gl.uniform2fv(this.constructor.__draw.uniform.direction, this.__getValue(this.direction));
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
    }
}

export {SilverRainSquaresWireNode};
