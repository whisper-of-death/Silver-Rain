// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainPixelationNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainPixelationNode extends SilverRainEffectNode {
	// Input
	size = 5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"size",
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
			uniform sampler2D u_texture;
            uniform float u_size;
            uniform float u_width;
            uniform float u_height;
			varying vec2 v_texCoord;
			void main() {
                float dx = u_size / u_width;
                float dy = u_size / u_height;
                vec2 coord = vec2(dx * floor(v_texCoord.x / dx), dy * floor(v_texCoord.y / dy));
				gl_FragColor = texture2D(u_texture, coord);
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
            texture: undefined,
            size: undefined,
            width: undefined,
            height: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
        this.constructor.__draw.uniform.width = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_width');
        this.constructor.__draw.uniform.height = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_height');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.size, this.__getValue(this.size));
        this.gl.uniform1f(this.constructor.__draw.uniform.width, this.width);
        this.gl.uniform1f(this.constructor.__draw.uniform.height, this.height);
    }
}

export {SilverRainPixelationNode};
