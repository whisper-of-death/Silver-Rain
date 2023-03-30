// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//               SilverRainSwapNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainSwapNode extends SilverRainTransitionNode {
	// Input
	reflection = 0.4;
	perspective = 0.2;
	depth = 3;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"reflection",
			"perspective",
			"depth",
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
			uniform float u_reflection;
			uniform float u_perspective;
			uniform float u_depth;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;

			const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
			const vec2 boundMin = vec2(0.0, 0.0);
			const vec2 boundMax = vec2(1.0, 1.0);

			bool inBounds (vec2 p) {
				return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
			}

			vec2 project (vec2 p) {
				return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
			}

			vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
				vec4 c = black;
				pfr = project(pfr);
				if (inBounds(pfr)) {
					c += mix(black, texture2D(u_texture1, pfr), u_reflection * mix(1.0, 0.0, pfr.y));
				}
				pto = project(pto);
				if (inBounds(pto)) {
					c += mix(black, texture2D(u_texture2, pto), u_reflection * mix(1.0, 0.0, pto.y));
				}
				return c;
			}

			void main() {
				vec2 pfr, pto = vec2(-1.);
				float size = mix(1.0, u_depth, u_mix);
				float persp = u_perspective * u_mix;
				pfr = (v_texCoord + vec2(-0.0, -0.5)) * vec2(size/(1.0-u_perspective*u_mix), size/(1.0-size*persp*v_texCoord.x)) + vec2(0.0, 0.5);

				size = mix(1.0, u_depth, 1.-u_mix);
				persp = u_perspective * (1.-u_mix);
				pto = (v_texCoord + vec2(-1.0, -0.5)) * vec2(size/(1.0-u_perspective*(1.0-u_mix)), size/(1.0-size*persp*(0.5-v_texCoord.x))) + vec2(1.0, 0.5);

				if (u_mix < 0.5) {
					if (inBounds(pfr)) {
						gl_FragColor = texture2D(u_texture1, pfr);
						return;
					}
					if (inBounds(pto)) {
						gl_FragColor = texture2D(u_texture2, pto);
						return;
					}
				}
				if (inBounds(pto)) {
					gl_FragColor = texture2D(u_texture2, pto);
					return;
				}
				if (inBounds(pfr)) {
					gl_FragColor = texture2D(u_texture1, pfr);
					return;
				}
				gl_FragColor = bgColor(v_texCoord, pfr, pto);
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
            reflection: undefined,
            perspective: undefined,
            depth: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.reflection = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_reflection');
        this.constructor.__draw.uniform.perspective = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_perspective');
        this.constructor.__draw.uniform.depth = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_depth');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.reflection, this.__getValue(this.reflection));
        this.gl.uniform1f(this.constructor.__draw.uniform.perspective, this.__getValue(this.perspective));
        this.gl.uniform1f(this.constructor.__draw.uniform.depth, this.__getValue(this.depth));
    }
}

export {SilverRainSwapNode};
