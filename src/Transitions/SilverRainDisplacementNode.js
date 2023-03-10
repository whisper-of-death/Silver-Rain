// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainDisplacementNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDisplacementNode extends SilverRainTransitionNode {
	// Input
	intensity = 0.3;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"intensity",
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
			uniform float u_intensity;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				vec4 orig1 = texture2D(u_texture1, v_texCoord);
				vec4 orig2 = texture2D(u_texture2, v_texCoord);
                vec4 currentImage = texture2D(u_texture1, vec2(v_texCoord.x, v_texCoord.y + u_mix * (orig2 * u_intensity)));
                vec4 nextImage = texture2D(u_texture2, vec2(v_texCoord.x, v_texCoord.y + (1.0 - u_mix) * (orig1 * u_intensity)));
                gl_FragColor = mix(currentImage, nextImage, u_mix);
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
            intensity: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.intensity = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_intensity');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.intensity, this.__getValue(this.intensity));
    }
}

export {SilverRainDisplacementNode};
