// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainBowTieVerticalNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainBowTieVerticalNode extends SilverRainTransitionNode {
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
			uniform float u_mix;
			uniform sampler2D u_texture1;
			uniform sampler2D u_texture2;
			varying vec2 v_texCoord;
			float check(vec2 p1, vec2 p2, vec2 p3) {
				return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
			}
			bool PointInTriangle (vec2 pt, vec2 p1, vec2 p2, vec2 p3) {
				bool b1, b2, b3;
				b1 = check(pt, p1, p2) < 0.0;
				b2 = check(pt, p2, p3) < 0.0;
				b3 = check(pt, p3, p1) < 0.0;
				return ((b1 == b2) && (b2 == b3));
			}
			bool in_top_triangle(vec2 p) {
				vec2 vertex1, vertex2, vertex3;
				vertex1 = vec2(0.5, u_mix);
				vertex2 = vec2(0.5-u_mix, 0.0);
				vertex3 = vec2(0.5+u_mix, 0.0);
				if (PointInTriangle(p, vertex1, vertex2, vertex3)) {
					return true;
				}
				return false;
			}
			bool in_bottom_triangle(vec2 p) {
				vec2 vertex1, vertex2, vertex3;
				vertex1 = vec2(0.5, 1.0 - u_mix);
				vertex2 = vec2(0.5-u_mix, 1.0);
				vertex3 = vec2(0.5+u_mix, 1.0);
				if (PointInTriangle(p, vertex1, vertex2, vertex3))
				{
					return true;
				}
				return false;
			}
			float blur_edge(vec2 bot1, vec2 bot2, vec2 top, vec2 testPt) {
				vec2 lineDir = bot1 - top;
				vec2 perpDir = vec2(lineDir.y, -lineDir.x);
				vec2 dirToPt1 = bot1 - testPt;
				float dist1 = abs(dot(normalize(perpDir), dirToPt1));

				lineDir = bot2 - top;
				perpDir = vec2(lineDir.y, -lineDir.x);
				dirToPt1 = bot2 - testPt;
				float min_dist = min(abs(dot(normalize(perpDir), dirToPt1)), dist1);

				if (min_dist < 0.005) {
					return min_dist / 0.005;
				} else  {
					return 1.0;
				};
			}
			void main() {
				vec4 color1 = texture2D(u_texture1, v_texCoord);
				vec4 color2 = texture2D(u_texture2, v_texCoord);
				if (in_top_triangle(v_texCoord)) {
					if (u_mix < 0.1) {
						gl_FragColor = color1;
					}
					if (v_texCoord.y < 0.5) {
						vec2 vertex1 = vec2(0.5, u_mix);
						vec2 vertex2 = vec2(0.5-u_mix, 0.0);
						vec2 vertex3 = vec2(0.5+u_mix, 0.0);
						gl_FragColor = mix(color1, color2, blur_edge(vertex2, vertex3, vertex1, v_texCoord));
					} else {
						if (u_mix > 0.0) {
							gl_FragColor = color2;
						} else {
							gl_FragColor = color1;
						}
					}
				} else if (in_bottom_triangle(v_texCoord)) {
					if(v_texCoord.y >= 0.5) {
						vec2 vertex1 = vec2(0.5, 1.0-u_mix);
						vec2 vertex2 = vec2(0.5-u_mix, 1.0);
						vec2 vertex3 = vec2(0.5+u_mix, 1.0);
						gl_FragColor = mix(color1, color2, blur_edge(vertex2, vertex3, vertex1, v_texCoord));
					} else {
						gl_FragColor = color1;
					}
				} else {
					gl_FragColor = color1;
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
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
    }
    __setUniform() {
    }
}

export {SilverRainBowTieVerticalNode};
