// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainDotsNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDotsNode extends SilverRainTransitionNode {
	// Input
	count = 20;
	center = [0,0];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"count",
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
			uniform float u_count;
			uniform vec2 u_center;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
                bool nextImage = distance(fract(v_texCoord * u_count), vec2(0.5, 0.5)) < (u_mix / distance(v_texCoord, u_center));
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = nextImage ? color2 : color1;
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
            count: undefined,
            center: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.count = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_count');
        this.constructor.__draw.uniform.center = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_center');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.count, this.__getValue(this.count));
        this.gl.uniform2fv(this.constructor.__draw.uniform.center, this.__getValue(this.center));
    }
}

export {SilverRainDotsNode};
