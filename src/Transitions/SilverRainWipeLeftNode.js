// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainWipeLeftNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainWipeLeftNode extends SilverRainTransitionNode {
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
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
			varying vec2 v_texCoord;
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(color1, color2, step(1.0 - v_texCoord.x, u_mix));
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
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
    }
    __setUniform() {
    }
}

export {SilverRainWipeLeftNode};
