// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//          SilverRainFramebuffer2dNode
// ----------------------------------------------

import {SilverRainBaseTextureNode} from './SilverRainBaseTextureNode.js';

class SilverRainFramebuffer2dNode extends SilverRainBaseTextureNode {
	// Global
	framebuffer = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
    }
    __init() {
		this.framebuffer = this.gl.createFramebuffer();
        this.__checkPowerOfTwo();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
        if(this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            this.__error("Framebuffer creation error");
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    reinit() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.__checkPowerOfTwo();
    }
    free() {
		super.free();
		this.gl.deleteFramebuffer(this.framebuffer);
		return this;
	}
    __clear() {
		this.root.clear("color");
	}
}

export {SilverRainFramebuffer2dNode};
