// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainDisplacementMapNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDisplacementMapNode extends SilverRainTransitionNode {
	// Input
	mapNode = undefined;
	strength = 0.5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"mapNode",
			"strength"
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
			uniform float u_strength;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			uniform sampler2D u_map;
			varying vec2 v_texCoord;
			void main() {
				float disp = texture2D(u_map, v_texCoord).r * u_strength;
				vec2 uv1 = vec2(v_texCoord.x + u_mix * disp, v_texCoord.y);
				vec2 uv2 = vec2(v_texCoord.x - (1.0 - u_mix) * disp, v_texCoord.y);
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
            map: undefined,
            strength: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.map = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_map');
        this.constructor.__draw.uniform.strength = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_strength');
    }
    __setUniform() {
		this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.__getValue(this.mapNode).texture);
        this.gl.uniform1i(this.constructor.__draw.uniform.map, 2);
        this.gl.uniform1f(this.constructor.__draw.uniform.strength, this.__getValue(this.strength));
    }
}

export {SilverRainDisplacementMapNode};
