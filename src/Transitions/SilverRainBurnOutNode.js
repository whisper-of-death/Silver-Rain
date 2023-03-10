// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainBurnOutNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainBurnOutNode extends SilverRainTransitionNode {
	// Input
	smoothness = 0.03;
	center = [0.5,0.5];
	color = [0,0,0,1];
	maxAmplitude = 0.05;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"smoothness",
			"center",
			"color",
			"maxAmplitude",
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
			uniform float u_smoothness;
			uniform vec2 u_center;
			uniform vec4 u_color;
			uniform float u_maxAmplitude;
			varying vec2 v_texCoord;
			const float PI = 3.14159265358979323846;
			float quadraticInOut(float t) {
				float p = 2.0 * t * t;
				return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
			}
			float getGradient(float r, float dist) {
				float d = r - dist;
				return mix(
					smoothstep(-u_smoothness, 0.0, r - dist * (1.0 + u_smoothness)),
					-1.0 - step(0.005, d),
					step(-0.005, d) * step(d, 0.01)
				);
			}
			float getWave(vec2 p){
				vec2 _p = p - u_center;
				float rads = atan(_p.y, _p.x);
				float degs = degrees(rads) + 180.0;
				vec2 range = vec2(0.0, PI * 30.0);
				vec2 domain = vec2(0.0, 360.0);
				float ratio = (PI * 30.0) / 360.0;
				degs = degs * ratio;
				float x = u_mix;
				float magnitude = mix(0.02, u_maxAmplitude, smoothstep(0.0, 1.0, x));
				float offset = mix(40.0, 30.0, smoothstep(0.0, 1.0, x));
				float ease_degs = quadraticInOut(sin(degs));
				float deg_wave_pos = (ease_degs * magnitude) * sin(x * offset);
				return x + deg_wave_pos;
			}
			void main() {
				float dist = distance(u_center, v_texCoord);
				float m = getGradient(getWave(v_texCoord), dist);
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				gl_FragColor = mix(
					u_mix == 0.0 ? color1 : mix(color1, color2, m),
					mix(color1, u_color, 0.75),
					step(m, -2.0)
				);
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
            smoothness: undefined,
            center: undefined,
            color: undefined,
            maxAmplitude: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.smoothness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_smoothness');
        this.constructor.__draw.uniform.center = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_center');
        this.constructor.__draw.uniform.color = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_color');
        this.constructor.__draw.uniform.maxAmplitude = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_maxAmplitude');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.smoothness, this.__getValue(this.smoothness));
        this.gl.uniform2fv(this.constructor.__draw.uniform.center, this.__getValue(this.center));
        this.gl.uniform4fv(this.constructor.__draw.uniform.color, this.__getValue(this.color));
        this.gl.uniform1f(this.constructor.__draw.uniform.maxAmplitude, this.__getValue(this.maxAmplitude));
    }
}

export {SilverRainBurnOutNode};
