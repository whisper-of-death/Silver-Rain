// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainFlyEyeNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainFlyEyeNode extends SilverRainTransitionNode {
	// Input
	size = 0.04;
	zoom = 50;
	colorSeparation = 0.3;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"size",
			"zoom",
			"colorSeparation"
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
			uniform float u_size;
			uniform float u_zoom;
			uniform float u_colorSeparation;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				float inv = 1.0 - u_mix;
				vec2 disp = u_size * vec2(cos(u_zoom * v_texCoord.x), sin(u_zoom * v_texCoord.y));
				vec4 color2 = texture2D(u_texture2, v_texCoord + inv * disp);
				float color1_r = texture2D(u_texture1, v_texCoord + u_mix * disp * (1.0 - u_colorSeparation)).r;
				float color1_g = texture2D(u_texture1, v_texCoord + u_mix * disp).g;
				float color1_b = texture2D(u_texture1, v_texCoord + u_mix * disp * (1.0 + u_colorSeparation)).b;
				vec4 color1 = vec4(color1_r, color1_g, color1_b, 1.0);
				gl_FragColor = color2 * u_mix + color1 * inv;
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
            zoom: undefined,
			colorSeparation: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
        this.constructor.__draw.uniform.zoom = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_zoom');
        this.constructor.__draw.uniform.colorSeparation = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_colorSeparation');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.size, this.__getValue(this.size));
        this.gl.uniform1f(this.constructor.__draw.uniform.zoom, this.__getValue(this.zoom));
        this.gl.uniform1f(this.constructor.__draw.uniform.colorSeparation, this.__getValue(this.colorSeparation));
    }
}

export {SilverRainFlyEyeNode};
