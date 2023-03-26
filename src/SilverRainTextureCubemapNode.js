// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//           SilverRainTextureCubemapNode
// ----------------------------------------------

import {SilverRainBaseTextureCubemapNode} from './SilverRainBaseTextureCubemapNode.js';

class SilverRainTextureCubemapNode extends SilverRainBaseTextureCubemapNode {
	// Input
	sourceNodeXPlus = undefined;
	sourceNodeXMinus = undefined;
	sourceNodeYPlus = undefined;
	sourceNodeYMinus = undefined;
	sourceNodeZPlus = undefined;
	sourceNodeZMinus = undefined;
	instantLoad = false;
	premultipliedAlpha = false;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"sourceNodeXPlus",
			"sourceNodeXMinus",
			"sourceNodeYPlus",
			"sourceNodeYMinus",
			"sourceNodeZPlus",
			"sourceNodeZMinus",
			"instantLoad",
			"premultipliedAlpha"
		]);
        this.__init();
        if(this.__getValue(this.enable) && this.__getValue(this.instantLoad)) {
            this.__setup();
            this.load();
            this.__cleanup();
        }
    }
    __init() {
		const sourceNodeXPlus = this.__getValue(this.sourceNodeXPlus);
        this.width = sourceNodeXPlus.width;
        this.height = sourceNodeXPlus.height;
        this.__checkPowerOfTwo();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
    }
    load() {
		const input = {
			xPlus: this.__getValue(this.sourceNodeXPlus),
			xMinus: this.__getValue(this.sourceNodeXMinus),
			yPlus: this.__getValue(this.sourceNodeYPlus),
			yMinus: this.__getValue(this.sourceNodeYMinus),
			zPlus: this.__getValue(this.sourceNodeZPlus),
			zMinus: this.__getValue(this.sourceNodeZMinus),
			pAlpha: this.__getValue(this.premultipliedAlpha),
		}
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
//         this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, input.pAlpha);
		[
			{node: input.xPlus, bind: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X},
			{node: input.xMinus, bind: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
			{node: input.yPlus, bind: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
			{node: input.yMinus, bind: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
			{node: input.zPlus, bind: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
			{node: input.zMinus, bind: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z},
		].forEach(e => {
			switch(e.node.constructor.name) {
				case "ImageBitmap":
				{
					const canvas = document.createElement("canvas");
					canvas.width = this.width;
					canvas.height = this.height;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(e.node, 0, 0);
					this.gl.texImage2D(e.bind, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
					break;
				}
				case "SilverRainImageNode":
				{
					this.gl.texImage2D(e.bind, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e.node.image);
					break;
				}
				case "SilverRainVideoNode":
				{
					this.gl.texImage2D(e.bind, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e.node.video);
					break;
				}
			}
		});
		this.generateMipmap();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
		return this;
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.load();
            this.__cleanup();
        }
    }
}

export {SilverRainTextureCubemapNode};
