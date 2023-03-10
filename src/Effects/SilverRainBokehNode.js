// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainBokehNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainBokehNode extends SilverRainEffectNode {
	// Input
	radius = 5;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"radius",
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

            #define GOLDEN_ANGLE 2.39996
            // #define ITERATIONS 150
            #define ITERATIONS 100

            uniform sampler2D u_texture;
			varying vec2 v_texCoord;
            uniform float u_radius;
            uniform float u_aspect;

            mat2 rot = mat2(cos(GOLDEN_ANGLE), sin(GOLDEN_ANGLE), -sin(GOLDEN_ANGLE), cos(GOLDEN_ANGLE));

            vec3 Bokeh(sampler2D tex, vec2 uv, float radius)
            {
                vec3 acc = vec3(0), div = acc;
                float r = 1.;
                vec2 vangle = vec2(0.0,radius*.01 / sqrt(float(ITERATIONS)));

                for (int j = 0; j < ITERATIONS; j++)
                {
                    // the approx increase in the scale of sqrt(0, 1, 2, 3...)
                    r += 1. / r;
                    vangle = rot * vangle;
//                     vec3 col = texture2D(tex, uv + (r-1.) * vangle).xyz; /// ... Sample the image
                    vec3 col = texture2D(tex, uv + vec2(1.0, u_aspect) * (r-1.) * vangle).xyz; /// ... Sample the image
                    col = col * col *1.8; // ... Contrast it for better highlights - leave this out elsewhere.
                    vec3 bokeh = pow(col, vec3(4));
                    acc += col * bokeh;
                    div += bokeh;
                }
                return acc / div;
            }
			void main() {
                gl_FragColor = vec4(Bokeh(u_texture, v_texCoord, u_radius), 1.0);
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
            radius: undefined,
            aspect: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.radius = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_radius');
        this.constructor.__draw.uniform.aspect = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_aspect');
    }
    __setUniform() {
        this.gl.uniform1f(this.constructor.__draw.uniform.radius, this.__getValue(this.radius));
        this.gl.uniform1f(this.constructor.__draw.uniform.aspect, this.width / this.height);
    }
}

export {SilverRainBokehNode};
