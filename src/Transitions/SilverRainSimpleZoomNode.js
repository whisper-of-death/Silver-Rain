// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainSimpleZoomNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainSimpleZoomNode extends SilverRainTransitionNode {
	// Input
	pivotPoint = [0.5,0.5];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"pivotPoint",
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
			uniform vec2 u_pivotPoint;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			vec2 zoom(vec2 uv, float value) {
				return u_pivotPoint + ((uv - u_pivotPoint) * (1.0 - value));
			}
			void main() {
				vec2 uv1 = zoom(v_texCoord, u_mix);
				vec2 uv2 = zoom(v_texCoord, 1.0 - u_mix);
				vec4 color1 = texture2D(u_texture1, uv1);
				vec4 color2 = texture2D(u_texture2, uv2);
				gl_FragColor = mix(color1, color2, u_mix);
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
			pivotPoint: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.pivotPoint = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_pivotPoint');
    }
    __setUniform() {
        this.gl.uniform2fv(this.constructor.__draw.uniform.pivotPoint, this.__getValue(this.pivotPoint));
    }
}

export {SilverRainSimpleZoomNode};
