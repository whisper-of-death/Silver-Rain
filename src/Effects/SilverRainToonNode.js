// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainToonNode
// ----------------------------------------------

import {SilverRainEffectNode} from './../SilverRainEffectNode.js';

class SilverRainToonNode extends SilverRainEffectNode {
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
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
            uniform vec2 u_size;
			varying vec2 v_texCoord;

            vec3 lumvals = vec3(0.2,0.7,0.9);

            vec3 rgb2hsv(vec3 c){
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
                vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }

            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            vec3 stepColor(vec3 col){
                vec3 hsv = rgb2hsv(col);
                if(hsv.z <= 0.33){
                    hsv.z = lumvals.x;
                }
                else if(hsv.z <= 0.67){
                    hsv.z = lumvals.y;
                }
                else{
                    hsv.z = lumvals.z;
                }
                return hsv2rgb(hsv);
            }

            float lum(vec3 rgb){
                return (0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b);
            }

            void main() {
                float k1 = 1.0;
                float k2 = 2.0;
                vec2 onePixel = vec2(1.0, 1.0) / u_size;
//                 float m[9];
                vec3 m[9];
                m[0] = texture2D(u_texture, v_texCoord + onePixel * vec2(-1, 1)).rgb;
                m[1] = texture2D(u_texture, v_texCoord + onePixel * vec2(0, 1)).rgb;
                m[2] = texture2D(u_texture, v_texCoord + onePixel * vec2(1, 1)).rgb;
                m[3] = texture2D(u_texture, v_texCoord + onePixel * vec2(-1, 0)).rgb;
                m[4] = texture2D(u_texture, v_texCoord).rgb;
                m[5] = texture2D(u_texture, v_texCoord + onePixel * vec2(1, 0)).rgb;
                m[6] = texture2D(u_texture, v_texCoord + onePixel * vec2(-1, -1)).rgb;
                m[7] = texture2D(u_texture, v_texCoord + onePixel * vec2(0, -1)).rgb;
                m[8] = texture2D(u_texture, v_texCoord + onePixel * vec2(1, -1)).rgb;

                vec3 x = k1 * m[0] - k1 * m[2] + k2 * m[3] - k2 * m[5] + k1 * m[6] - k1 * m[8];
                vec3 y = k1 * m[0] + k2 * m[1] + k1 * m[2] - k1 * m[6] - k2 * m[7] - k1 * m[8];

                float finalLum = pow(lum(x*x + y*y), 0.5);
                if(finalLum < 0.4){
                    finalLum = smoothstep(0.0,1.0,finalLum);
                }
                else{
                    finalLum = 1.0;
                }
                vec3 color1 = vec3(1.0 - finalLum);

                vec4 tex = texture2D(u_texture, v_texCoord);
                vec3 color2 = stepColor(tex.rgb);
                vec3 finalrgb = min(color1.rgb, color2.rgb);
//                 vec3 finalrgb = color1.rgb;
                gl_FragColor = vec4(finalrgb,1.0);
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
            size: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.size = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_size');
    }
    __setUniform() {
        this.gl.uniform2f(this.constructor.__draw.uniform.size, this.width, this.height);
    }
}

export {SilverRainToonNode};
