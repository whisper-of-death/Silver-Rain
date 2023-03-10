// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainCrossHatchNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainCrossHatchNode extends SilverRainTransitionNode {
	// Input
	center = [0.5,0.5];
	threshold = 3;
	fadeEdge = 0.1;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"center",
			"threshold",
			"fadeEdge",
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
			uniform vec2 u_center;
			uniform float u_threshold;
			uniform float u_fadeEdge;
			varying vec2 v_texCoord;
			float rand(vec2 co) {
				return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
			}
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				float dist = distance(u_center, v_texCoord) / u_threshold;
				float r = u_mix - min(rand(vec2(v_texCoord.y, 0.0)), rand(vec2(0.0, v_texCoord.x)));
				gl_FragColor = mix(
					color1,
					color2,
					mix(
						0.0,
						mix(
							step(dist, r),
							1.0,
							smoothstep(1.0-u_fadeEdge, 1.0, u_mix)
						),
						smoothstep(0.0, u_fadeEdge, u_mix)
					)
				);
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
            center: undefined,
            threshold: undefined,
            fadeEdge: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.center = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_center');
        this.constructor.__draw.uniform.threshold = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_threshold');
        this.constructor.__draw.uniform.fadeEdge = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_fadeEdge');
    }
    __setUniform() {
        this.gl.uniform2fv(this.constructor.__draw.uniform.center, this.__getValue(this.center));
        this.gl.uniform1f(this.constructor.__draw.uniform.threshold, this.__getValue(this.threshold));
        this.gl.uniform1f(this.constructor.__draw.uniform.fadeEdge, this.__getValue(this.fadeEdge));
    }
}

export {SilverRainCrossHatchNode};
