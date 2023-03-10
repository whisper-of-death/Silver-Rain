// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainSwirlNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainSwirlNode extends SilverRainTransitionNode {
	// Input
	angle = Math.PI * 2.5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"angle",
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
			uniform float u_angle;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			void main() {
				vec2 uv = v_texCoord;
				const float radius = 1.0;
				uv -= vec2(0.5,0.5);
				float dist = length(uv);
				if(dist < radius) {
					float percent = (radius - dist) / radius;
					float a = (u_mix <= 0.5 ) ? mix(0.0, 1.0, u_mix/0.5) : mix(1.0, 0.0,(u_mix-0.5)/0.5);
					float theta = percent * percent * a * u_angle * 3.14159;
					float s = sin(theta);
					float c = cos(theta);
					uv = vec2(dot(uv, vec2(c, -s)), dot(uv, vec2(s, c)));
				}
				uv += vec2(0.5,0.5);
				vec4 color1 = texture2D(u_texture1, uv);
				vec4 color2 = texture2D(u_texture2, uv);
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
            angle: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.angle = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_angle');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.angle, this.__getValue(this.angle));
    }
}

export {SilverRainSwirlNode};
