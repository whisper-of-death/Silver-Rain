// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainSobelNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainSobelNode extends SilverRainEffectNode {
	// Input
	type = "sobel";
	// Local
	__k1 = undefined;
	__k2 = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"type",
		]);
        switch(this.type.toLowerCase()) {
        case "scharr":
            this.__k1 = 3;
            this.__k2 = 10;
            break;
        default:
            this.__k1 = 1;
            this.__k2 = 2;
            break;
        }
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
            uniform vec2 u_size;
			uniform sampler2D u_texture;
			uniform float u_k1;
			uniform float u_k2;
			varying vec2 v_texCoord;
            float intensity(in vec4 color) {
                return sqrt(color.x * color.x + color.y * color.y + color.z * color.z);
            }
			void main() {
                vec2 onePixel = vec2(1.0, 1.0) / u_size;
                float m[9];
                m[0] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, 1)));
                m[1] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(0, 1)));
                m[2] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(1, 1)));
                m[3] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, 0)));
                m[4] = intensity(texture2D(u_texture, v_texCoord));
                m[5] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(1, 0)));
                m[6] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, -1)));
                m[7] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(0, -1)));
                m[8] = intensity(texture2D(u_texture, v_texCoord + onePixel * vec2(1, -1)));

                float x = u_k1 * m[0] - u_k1 * m[2] + u_k2 * m[3] - u_k2 * m[5] + u_k1 * m[6] - u_k1 * m[8];
                float y = u_k1 * m[0] + u_k2 * m[1] + u_k1 * m[2] - u_k1 * m[6] - u_k2 * m[7] - u_k1 * m[8];

                float color = sqrt(x * x + y * y);
                gl_FragColor = vec4(color, color, color, 1.0);
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
            k1: undefined,
            k2: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
        this.constructor.__draw.uniform.k1 = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_k1');
        this.constructor.__draw.uniform.k2 = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_k2');
    }
    __setUniform() {
        this.gl.uniform2f(this.constructor.__draw.uniform.size, this.width, this.height);
        this.gl.uniform1f(this.constructor.__draw.uniform.k1, this.__k1);
        this.gl.uniform1f(this.constructor.__draw.uniform.k2, this.__k2);
    }
}

export {SilverRainSobelNode};
