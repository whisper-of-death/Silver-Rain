// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainCircleNode
// ----------------------------------------------

import {SilverRainFramebuffer2dNode} from './../SilverRainFramebuffer2dNode.js';

class SilverRainCircleNode extends SilverRainFramebuffer2dNode {
	// Input
	innerRadius = 0;
	outherRadius = 100;
	color = [0,0,0,1];
	instantDraw = undefined;
	// Local
	__vSrc = `
		attribute vec4 a_vertex;
		varying vec4 v_vertex;
		void main() {
			gl_Position = a_vertex;
			v_vertex = a_vertex;
		}
	`;
	__fSrc = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"innerRadius",
			"outherRadius",
			"color",
			"instantDraw",
		]);
		this.__createFragmentShaderSource();
		this.__init();
    }
    __createFragmentShaderSource() {
        this.__fSrc = `
            precision ${this.root.precision} float;
            uniform vec4 u_color;
            uniform float u_innerRadius;
            uniform float u_outherRadius;
			varying vec4 v_vertex;
			void main() {
                vec4 bgColor = vec4(0.0,0.0,0.0,0.0);
                float f;
                float d = distance(v_vertex.xy, vec2(0.0, 0.0));
                if(d > u_outherRadius || d < u_innerRadius) {
                    f = 0.0;
                } else {
                    f = 1.0;
                }
                gl_FragColor = mix(bgColor, u_color, f);
			}
        `;
	}
    __init() {
        const diameter = this.__getValue(this.outherRadius) * 2;
        this.width = diameter;
        this.height = diameter;
        super.__init();
    }
    static __draw = {
        ready: false,
		vertexData: [
			-1,1,
			-1,-1,
			 1,-1,
			 1,1
		],
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
        },
        uniform: {
            color: undefined,
            innerRadius: undefined,
            outherRadius: undefined
        },
        buffer: {
            vertex: undefined,
            index: undefined
        },
    }
    __createProgram() {
        const draw = this.constructor.__draw;
        draw.program = this.root.program(this.__vSrc, this.__fSrc);
        draw.buffer.vertex = this.gl.createBuffer();
        draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(draw.indexData), this.gl.STATIC_DRAW);
        draw.attribute.vertex = this.gl.getAttribLocation(draw.program, "a_vertex");
        draw.uniform.color = this.gl.getUniformLocation(draw.program, 'u_color');
        draw.uniform.innerRadius = this.gl.getUniformLocation(draw.program, 'u_innerRadius');
        draw.uniform.outherRadius = this.gl.getUniformLocation(draw.program, 'u_outherRadius');
        draw.ready = true;
    }
    draw() {
        const draw = this.constructor.__draw;
        if(!draw.ready) {
            this.__createProgram();
        }
        this.gl.useProgram(draw.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
        this.gl.vertexAttribPointer(draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.vertex);

        this.gl.uniform4fv(draw.uniform.color, this.__getValue(this.color));
        this.gl.uniform1f(draw.uniform.innerRadius, this.__getValue(this.innerRadius) * 2 / this.width);
        this.gl.uniform1f(draw.uniform.outherRadius, this.__getValue(this.outherRadius) * 2 / this.width);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);

        this.__clear();

        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.generateMipmap();
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainCircleNode};
