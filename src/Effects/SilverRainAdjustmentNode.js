// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainAdjustmentNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainAdjustmentNode extends SilverRainEffectNode {
	// Input
	gamma = 1;
	brightness = 0; // [-1, 1]
	contrast = 1;   // [-1, 1]
	saturation = 0; // [-1, 1]
	exposure = 0    // [-1, 1]
	red = 1;
	green = 1;
	blue = 1;
	alpha = 1;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
            "gamma",
            "brightness",
            "contrast",
            "saturation",
            "exposure",
            "red",
            "green",
            "blue",
            "alpha",
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
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
            uniform float u_gamma;
            uniform float u_brightness;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_exposure;
            uniform float u_red;
            uniform float u_green;
            uniform float u_blue;
            uniform float u_alpha;
			vec3 adjustGamma(vec3 color, float value) {
                return pow(color, vec3(1.0 / value));
            }
			vec3 adjustBrightness(vec3 color, float value) {
                return color + value;
            }
            vec3 adjustContrast(vec3 color, float value) {
                return 0.5 + value * (color - 0.5);
            }
            vec3 adjustExposure(vec3 color, float value) {
                return (1.0 + value) * color;
            }
            vec3 adjustSaturation(vec3 color, float value) {
                const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
                vec3 grayscale = vec3(dot(color, luminosityFactor));
                return mix(grayscale, color, 1.0 + value);
            }
            void main() {
				vec4 texel = texture2D(u_texture, v_texCoord);
                vec3 color = texel.rgb;
                color = adjustGamma(color, u_gamma);
                color = adjustBrightness(color, u_brightness);
                color = adjustContrast(color, u_contrast);
                color = adjustExposure(color, u_exposure);
                color = adjustSaturation(color, u_saturation);
                color.r *= u_red;
                color.g *= u_green;
                color.b *= u_blue;
                float alpha = texel.a * u_alpha;
                gl_FragColor = vec4(color, alpha);
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
            gamma: undefined,
            contrast: undefined,
            saturation: undefined,
            brightness: undefined,
            red: undefined,
            green: undefined,
            blue: undefined,
            alpha: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.gamma = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_gamma');
        this.constructor.__draw.uniform.brightness = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_brightness');
        this.constructor.__draw.uniform.contrast = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_contrast');
        this.constructor.__draw.uniform.saturation = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_saturation');
        this.constructor.__draw.uniform.exposure = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_exposure');
        this.constructor.__draw.uniform.red = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_red');
        this.constructor.__draw.uniform.green = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_green');
        this.constructor.__draw.uniform.blue = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_blue');
        this.constructor.__draw.uniform.alpha = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_alpha');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.gamma, this.__getValue(this.gamma));
        this.gl.uniform1f(this.constructor.__draw.uniform.brightness, this.__getValue(this.brightness));
        this.gl.uniform1f(this.constructor.__draw.uniform.contrast, this.__getValue(this.contrast));
        this.gl.uniform1f(this.constructor.__draw.uniform.saturation, this.__getValue(this.saturation));
        this.gl.uniform1f(this.constructor.__draw.uniform.exposure, this.__getValue(this.exposure));
        this.gl.uniform1f(this.constructor.__draw.uniform.red, this.__getValue(this.red));
        this.gl.uniform1f(this.constructor.__draw.uniform.green, this.__getValue(this.green));
        this.gl.uniform1f(this.constructor.__draw.uniform.blue, this.__getValue(this.blue));
        this.gl.uniform1f(this.constructor.__draw.uniform.alpha, this.__getValue(this.alpha));
    }
}

export {SilverRainAdjustmentNode};
