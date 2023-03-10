// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainCanvasNode
// ----------------------------------------------

import {SilverRainBaseTextureNode} from './SilverRainBaseTextureNode.js';

class SilverRainCanvasNode extends SilverRainBaseTextureNode {
	// Input
	width = 100;
	height = 100;
	code = undefined;
	instantDraw = undefined;
	// Global
	canvas = undefined;
	context = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"width",
			"height",
			"code",
			"instantDraw",
		]);
        this.__init();
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    __init() {
        this.texture = this.gl.createTexture();
        this.__checkPowerOfTwo();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
    }
    draw() {
        this.canvas.width = this.__getValue(this.width);
        this.canvas.height = this.__getValue(this.height);
        if(this.__getType(this.code) === "function") {
            this.code.call(this);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.canvas);
        this.generateMipmap();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return this;
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainCanvasNode};
