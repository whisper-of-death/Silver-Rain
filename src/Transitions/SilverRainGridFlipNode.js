// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainGridFlipNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainGridFlipNode extends SilverRainTransitionNode {
	// Input
	size = [10,10];
	pause = 0.1;
	dividerWidth = 0.01;
	bgColor = [0,0,0,1];
	randomness = 0.1;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"size",
			"pause",
			"dividerWidth",
			"bgColor",
			"randomness",
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
			uniform ivec2 u_size;
			uniform float u_pause;
			uniform float u_dividerWidth;
			uniform vec4 u_bgColor;
			uniform float u_randomness;
			varying vec2 v_texCoord;
			float rand (vec2 co) {
				return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
			}
			float getDelta(vec2 p) {
				vec2 rectanglePos = floor(vec2(u_size) * p);
				vec2 rectangleSize = vec2(1.0 / vec2(u_size).x, 1.0 / vec2(u_size).y);
				float top = rectangleSize.y * (rectanglePos.y + 1.0);
				float bottom = rectangleSize.y * rectanglePos.y;
				float left = rectangleSize.x * rectanglePos.x;
				float right = rectangleSize.x * (rectanglePos.x + 1.0);
				float minX = min(abs(p.x - left), abs(p.x - right));
				float minY = min(abs(p.y - top), abs(p.y - bottom));
				return min(minX, minY);
			}
			float getDividerSize() {
				vec2 rectangleSize = vec2(1.0 / vec2(u_size).x, 1.0 / vec2(u_size).y);
				return min(rectangleSize.x, rectangleSize.y) * u_dividerWidth;
			}
			void main() {
				vec2 texCoord = v_texCoord;
				vec4 color1 = texture2D(u_texture1, texCoord);
				vec4 color2 = texture2D(u_texture2, texCoord);
				if(u_mix < u_pause) {
					float currentProg = u_mix / u_pause;
					float a = 1.0;
					if(getDelta(texCoord) < getDividerSize()) {
						a = 1.0 - currentProg;
					}
					gl_FragColor = mix(u_bgColor, texture2D(u_texture1, texCoord), a);
				} else if(u_mix < 1.0 - u_pause) {
					if(getDelta(texCoord) < getDividerSize()) {
						gl_FragColor = u_bgColor;
					} else {
						float currentProg = (u_mix - u_pause) / (1.0 - u_pause * 2.0);
						vec2 q = texCoord;
						vec2 rectanglePos = floor(vec2(u_size) * q);

						float r = rand(rectanglePos) - u_randomness;
						float cp = smoothstep(0.0, 1.0 - r, currentProg);

						float rectangleSize = 1.0 / vec2(u_size).x;
						float delta = rectanglePos.x * rectangleSize;
						float offset = rectangleSize / 2.0 + delta;

						texCoord.x = (texCoord.x - offset)/abs(cp - 0.5)*0.5 + offset;
						vec4 a = color1;
						vec4 b = color2;

						float s = step(abs(vec2(u_size).x * (q.x - delta) - 0.5), abs(cp - 0.5));
						gl_FragColor = mix(u_bgColor, mix(b, a, step(cp, 0.5)), s);
					}
				} else {
					float currentProg = (u_mix - 1.0 + u_pause) / u_pause;
					float a = 1.0;
					if(getDelta(texCoord) < getDividerSize()) {
						a = currentProg;
					}
					gl_FragColor = mix(u_bgColor, color2, a);
				}
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
            pause: undefined,
            dividerWidth: undefined,
            bgColor: undefined,
            randomness: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
        this.constructor.__draw.uniform.pause = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_pause');
        this.constructor.__draw.uniform.dividerWidth = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_dividerWidth');
        this.constructor.__draw.uniform.bgColor = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_bgColor');
        this.constructor.__draw.uniform.randomness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_randomness');
    }
    __setUniform() {
        this.gl.uniform2iv(this.constructor.__draw.uniform.size, this.__getValue(this.size));
        this.gl.uniform1f(this.constructor.__draw.uniform.pause, this.__getValue(this.pause));
        this.gl.uniform1f(this.constructor.__draw.uniform.dividerWidth, this.__getValue(this.dividerWidth));
        this.gl.uniform4fv(this.constructor.__draw.uniform.bgColor, this.__getValue(this.bgColor));
        this.gl.uniform1f(this.constructor.__draw.uniform.randomness, this.__getValue(this.randomness));
    }
}

export {SilverRainGridFlipNode};
