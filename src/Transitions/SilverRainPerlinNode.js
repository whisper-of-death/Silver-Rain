// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainPerlinNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainPerlinNode extends SilverRainTransitionNode {
	// Input
	scale = 4;
	smoothness = 0.01;
	seed = 12.5 + Math.random();
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"scale",
			"smoothness",
			"seed"
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
			uniform float u_scale;
			uniform float u_smoothness;
			uniform float u_seed;
			varying vec2 v_texCoord;
			float random(vec2 co) {
				highp float a = u_seed;
				highp float b = 78.233;
				highp float c = 43758.5453;
				highp float dt= dot(co.xy ,vec2(a,b));
				highp float sn= mod(dt,3.14);
				return fract(sin(sn) * c);
			}
			float noise (in vec2 st) {
				vec2 i = floor(st);
				vec2 f = fract(st);
				float a = random(i);
				float b = random(i + vec2(1.0, 0.0));
				float c = random(i + vec2(0.0, 1.0));
				float d = random(i + vec2(1.0, 1.0));
				vec2 u = f*f*(3.0-2.0*f);
				return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
			}
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				float n = noise(v_texCoord * u_scale);
				float p = mix(-u_smoothness, 1.0 + u_smoothness, u_mix);
				float lower = p - u_smoothness;
				float higher = p + u_smoothness;
				float q = smoothstep(lower, higher, n);
				gl_FragColor = mix(color1, color2, 1.0 - q);
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
            scale: undefined,
            smoothness: undefined,
            seed: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.scale = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_scale');
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
        this.constructor.__draw.uniform.seed = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_seed');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.scale, this.__getValue(this.scale));
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
        this.gl.uniform1f(this.constructor.__draw.uniform.seed, this.__getValue(this.seed));
    }
}

export {SilverRainPerlinNode};
