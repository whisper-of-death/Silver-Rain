// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainBounceNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainBounceNode extends SilverRainTransitionNode {
	// Input
	shadowColour = [0,0,0,0.6];
	shadowHeight = 0.075;
	bounces = 3;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"shadowColour",
			"shadowHeight",
			"bounces"
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
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			uniform vec4 u_shadowColor;
			uniform float u_shadowHeight;
			uniform float u_bounces;
			varying vec2 v_texCoord;
			const float PI = 3.14159265358;
			void main() {
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				float stime = sin(u_mix * PI / 2.);
				float phase = u_mix * PI * u_bounces;
				float y = (abs(cos(phase))) * (1.0 - stime);
				float d = v_texCoord.y - y;
				vec4 m1 = mix(
					color2,
					u_shadowColor,
					step(d, u_shadowHeight) * (1. - mix(
						((d / u_shadowHeight) * u_shadowColor.a) + (1.0 - u_shadowColor.a),
						1.0,
						smoothstep(0.95, 1., u_mix)
					))
				);
				gl_FragColor = mix(m1, texture2D(u_texture1, vec2(v_texCoord.x, v_texCoord.y + (1.0 - y))), step(d, 0.0));
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
            shadowColour: undefined,
            shadowHeight: undefined,
            bounces: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.shadowColour = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_shadowColor');
        this.constructor.__draw.uniform.shadowHeight = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_shadowHeight');
        this.constructor.__draw.uniform.bounces = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_bounces');
    }
    __setUniform() {
        this.gl.uniform4fv(this.constructor.__draw.uniform.shadowColour, this.__getValue(this.shadowColour));
        this.gl.uniform1f(this.constructor.__draw.uniform.shadowHeight, this.__getValue(this.shadowHeight));
        this.gl.uniform1f(this.constructor.__draw.uniform.bounces, this.__getValue(this.bounces));
    }
}

export {SilverRainBounceNode};
