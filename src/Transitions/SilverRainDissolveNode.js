// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainDissolveNode
// ----------------------------------------------

import {SilverRainTransitionNode} from './../SilverRainTransitionNode.js';

class SilverRainDissolveNode extends SilverRainTransitionNode {
	// Input
	noise = [8,6,4];
	prevEdgeStart = 0.01;
	prevEdgeWidth = 0.05;
	nextEdgeStart = 0.01;
	nextEdgeWidth = 0.05;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"noise",
			"prevEdgeStart",
			"prevEdgeWidth",
			"nextEdgeStart",
			"nextEdgeWidth",
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
            uniform float u_noiseX;
            uniform float u_noiseY;
            uniform float u_noiseZ;
            uniform float u_prevEdgeStart;
            uniform float u_prevEdgeWidth;
            uniform float u_nextEdgeStart;
            uniform float u_nextEdgeWidth;

            varying vec3 vPosition;
            varying vec2 v_texCoord;

            vec3 mod289(vec3 x)
            {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            vec4 mod289(vec4 x)
            {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            vec4 permute(vec4 x)
            {
                return mod289(((x*34.0)+1.0)*x);
            }

            vec4 taylorInvSqrt(vec4 r)
            {
                return 1.79284291400159 - 0.85373472095314 * r;
            }

            vec3 fade(vec3 t) {
                return t*t*t*(t*(t*6.0-15.0)+10.0);
            }

            // Classic Perlin noise
            float cnoise(vec3 P)
            {
                vec3 Pi0 = floor(P); // Integer part for indexing
                vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
                Pi0 = mod289(Pi0);
                Pi1 = mod289(Pi1);
                vec3 Pf0 = fract(P); // Fractional part for interpolation
                vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
                vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
                vec4 iy = vec4(Pi0.yy, Pi1.yy);
                vec4 iz0 = Pi0.zzzz;
                vec4 iz1 = Pi1.zzzz;

                vec4 ixy = permute(permute(ix) + iy);
                vec4 ixy0 = permute(ixy + iz0);
                vec4 ixy1 = permute(ixy + iz1);

                vec4 gx0 = ixy0 * (1.0 / 7.0);
                vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
                gx0 = fract(gx0);
                vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
                vec4 sz0 = step(gz0, vec4(0.0));
                gx0 -= sz0 * (step(0.0, gx0) - 0.5);
                gy0 -= sz0 * (step(0.0, gy0) - 0.5);

                vec4 gx1 = ixy1 * (1.0 / 7.0);
                vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
                gx1 = fract(gx1);
                vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
                vec4 sz1 = step(gz1, vec4(0.0));
                gx1 -= sz1 * (step(0.0, gx1) - 0.5);
                gy1 -= sz1 * (step(0.0, gy1) - 0.5);

                vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
                vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
                vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
                vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
                vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
                vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
                vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
                vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

                vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
                g000 *= norm0.x;
                g010 *= norm0.y;
                g100 *= norm0.z;
                g110 *= norm0.w;
                vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
                g001 *= norm1.x;
                g011 *= norm1.y;
                g101 *= norm1.z;
                g111 *= norm1.w;

                float n000 = dot(g000, Pf0);
                float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
                float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
                float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
                float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
                float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
                float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
                float n111 = dot(g111, Pf1);

                vec3 fade_xyz = fade(Pf0);
                vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
                vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
                float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
                return 2.2 * n_xyz;
            }

            void main(void) {
                vec4 colorPrev = texture2D(u_texture1, v_texCoord);
                vec4 colorNext = texture2D(u_texture2, v_texCoord);

                float noise = (cnoise(vec3(v_texCoord.x * u_noiseX, v_texCoord.y * u_noiseY, u_noiseZ)) + 1.0) / 2.0
                    * (1.0 - (u_prevEdgeStart + u_prevEdgeWidth + u_nextEdgeStart + u_nextEdgeWidth))
                    + (u_prevEdgeStart + u_prevEdgeWidth + u_nextEdgeStart + u_nextEdgeWidth) * 0.5;

                gl_FragColor = colorPrev * smoothstep(u_mix - (u_prevEdgeStart + u_prevEdgeWidth), u_mix - u_prevEdgeStart, noise)
                    + colorNext * smoothstep((1.0 - u_mix) - (u_nextEdgeStart + u_nextEdgeWidth), (1.0 - u_mix) - u_nextEdgeStart, (1.0 - noise));
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
            noiseX: undefined,
            noiseY: undefined,
            noiseZ: undefined,
            prevEdgeStart: undefined,
            prevEdgeWidth: undefined,
            nextEdgeStart: undefined,
            nextEdgeWidth: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.constructor.__draw.uniform.noiseX = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_noiseX');
        this.constructor.__draw.uniform.noiseY = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_noiseY');
        this.constructor.__draw.uniform.noiseZ = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_noiseZ');
        this.constructor.__draw.uniform.prevEdgeStart = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_prevEdgeStart');
        this.constructor.__draw.uniform.prevEdgeWidth = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_prevEdgeWidth');
        this.constructor.__draw.uniform.nextEdgeStart = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_nextEdgeStart');
        this.constructor.__draw.uniform.nextEdgeWidth = this.gl.getUniformLocation(this.constructor.__draw.program, 'u_nextEdgeWidth');
    }
    __setUniform() {
        const noise = this.__getValue(this.noise);
		this.gl.uniform1f(this.constructor.__draw.uniform.noiseX, noise[0]);
        this.gl.uniform1f(this.constructor.__draw.uniform.noiseY, noise[1]);
        this.gl.uniform1f(this.constructor.__draw.uniform.noiseZ, noise[2]);
        this.gl.uniform1f(this.constructor.__draw.uniform.prevEdgeStart, this.__getValue(this.prevEdgeStart));
        this.gl.uniform1f(this.constructor.__draw.uniform.prevEdgeWidth, this.__getValue(this.prevEdgeWidth));
        this.gl.uniform1f(this.constructor.__draw.uniform.nextEdgeStart, this.__getValue(this.nextEdgeStart));
        this.gl.uniform1f(this.constructor.__draw.uniform.nextEdgeWidth, this.__getValue(this.nextEdgeWidth));
        this.gl.uniform2fv(this.constructor.__draw.uniform.resolution, [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight]);
    }
}

export {SilverRainDissolveNode};
