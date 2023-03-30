// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainDoorwayNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDoorwayNode extends SilverRainTransitionNode {
	// Input
	reflection = 0.4;
	perspective = 0.4;
	depth = 3;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"reflection",
			"perspective",
			"depth"
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
			uniform float u_reflection;
			uniform float u_perspective;
			uniform float u_depth;
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

			vec4 bgColor (vec2 p, vec2 pto) {
				vec4 c = black;
				pto = project(pto);
				if (inBounds(pto)) {
					c += mix(black, texture2D(u_texture2, pto), u_reflection * mix(1.0, 0.0, pto.y));
				}
				return c;
			}
			void main() {
				vec2 pfr = vec2(-1.), pto = vec2(-1.);
				float middleSlit = 2.0 * abs(v_texCoord.x - 0.5) - u_mix;
				if (middleSlit > 0.0) {
					pfr = v_texCoord + (v_texCoord.x > 0.5 ? -1.0 : 1.0) * vec2(0.5*u_mix, 0.0);
					float d = 1.0 / (1.0 + u_perspective * u_mix * (1.0 - middleSlit));
					pfr.y -= d/2.;
					pfr.y *= d;
					pfr.y += d/2.;
				}
				float size = mix(1.0, u_depth, 1.-u_mix);
				pto = (v_texCoord + vec2(-0.5, -0.5)) * vec2(size, size) + vec2(0.5, 0.5);
				if (inBounds(pfr)) {
					gl_FragColor = texture2D(u_texture1, pfr);
				}
				else if (inBounds(pto)) {
					gl_FragColor = texture2D(u_texture2, pto);
				}
				else {
					gl_FragColor = bgColor(v_texCoord, pto);
				}
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
			depth: undefined,
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

export {SilverRainDoorwayNode};
