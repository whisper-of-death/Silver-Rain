// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainHexagonNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainHexagonNode extends SilverRainTransitionNode {
	// Input
	steps = 50;
	horizontalHexagons = 20;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"steps",
			"horizontalHexagons",
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
			uniform vec2 u_dimension;
			uniform int u_steps;
			uniform float u_horizontalHexagons;
			varying vec2 v_texCoord;
			float ratio = u_dimension.x / u_dimension.y;
			struct Hexagon {
				float q;
				float r;
				float s;
			};
			Hexagon createHexagon(float q, float r) {
				Hexagon hex;
				hex.q = q;
				hex.r = r;
				hex.s = -q - r;
				return hex;
			}
			Hexagon roundHexagon(Hexagon hex) {
				float q = floor(hex.q + 0.5);
				float r = floor(hex.r + 0.5);
				float s = floor(hex.s + 0.5);
				float deltaQ = abs(q - hex.q);
				float deltaR = abs(r - hex.r);
				float deltaS = abs(s - hex.s);
				if (deltaQ > deltaR && deltaQ > deltaS)
					q = -r - s;
				else if (deltaR > deltaS)
					r = -q - s;
				else
					s = -q - r;
				return createHexagon(q, r);
			}
			Hexagon hexagonFromPoint(vec2 point, float size) {
				point.y /= ratio;
				point = (point - 0.5) / size;
				float q = (sqrt(3.0) / 3.0) * point.x + (-1.0 / 3.0) * point.y;
				float r = 0.0 * point.x + 2.0 / 3.0 * point.y;
				Hexagon hex = createHexagon(q, r);
				return roundHexagon(hex);
			}
			vec2 pointFromHexagon(Hexagon hex, float size) {
				float x = (sqrt(3.0) * hex.q + (sqrt(3.0) / 2.0) * hex.r) * size + 0.5;
				float y = (0.0 * hex.q + (3.0 / 2.0) * hex.r) * size + 0.5;
				return vec2(x, y * ratio);
			}
			void main() {
				float dist = 2.0 * min(u_mix, 1.0 - u_mix);
				dist = u_steps > 0 ? ceil(dist * float(u_steps)) / float(u_steps) : dist;
				float size = (sqrt(3.0) / 3.0) * dist / u_horizontalHexagons;
				vec2 point = dist > 0.0 ? pointFromHexagon(hexagonFromPoint(v_texCoord, size), size) : v_texCoord;
				vec4 color1 = texture2D(u_texture1, point);
				vec4 color2 = texture2D(u_texture2, point);
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
            steps: undefined,
            horizontalHexagons: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.steps = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_steps');
        this.constructor.__draw.uniform.horizontalHexagons = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_horizontalHexagons');
    }
    __setUniform() {
        this.gl.uniform1i(this.constructor.__draw.uniform.steps, this.__getValue(this.steps));
        this.gl.uniform1f(this.constructor.__draw.uniform.horizontalHexagons, this.__getValue(this.horizontalHexagons));
    }
}

export {SilverRainHexagonNode};
