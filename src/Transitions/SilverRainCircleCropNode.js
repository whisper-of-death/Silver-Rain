// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainCircleCropNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainCircleCropNode extends SilverRainTransitionNode {
	// Input
	bgColor = [0,0,0,1];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"bgColor",
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
			uniform vec2 u_dimension;
			uniform float u_mix;
			uniform vec4 u_bgColor;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				float ratio = u_dimension.x / u_dimension.y;
				vec2 ratio2 = vec2(1.0, 1.0 / ratio);
				float s = pow(2.0 * abs(u_mix - 0.5), 2.0);
				float dist = length((vec2(v_texCoord) - 0.5) * ratio2);
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				vec4 color = u_mix < 0.5 ? color1 : color2;
				gl_FragColor = mix(color, u_bgColor, step(s, dist));
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
            bgColor: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.bgColor = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_bgColor');
    }
    __setUniform() {
        this.gl.uniform4fv(this.constructor.__draw.uniform.bgColor, this.__getValue(this.bgColor));
    }
}

export {SilverRainCircleCropNode};
