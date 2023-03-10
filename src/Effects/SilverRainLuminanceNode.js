// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainLuminanceNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainLuminanceNode extends SilverRainEffectNode {
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
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			void main() {
                const vec3 w = vec3(0.2125, 0.7154, 0.0721);
				vec3 color = texture2D(u_texture, v_texCoord).rgb;
                float l = dot(color, w);
				gl_FragColor = vec4(l, l, l, 1.0);
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
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
}

export {SilverRainLuminanceNode};
