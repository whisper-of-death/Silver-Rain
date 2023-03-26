// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainTextureNode
// ----------------------------------------------

import {SilverRainBaseTextureNode} from './SilverRainBaseTextureNode.js';

class SilverRainTextureNode extends SilverRainBaseTextureNode {
	// Input
	sourceNode = undefined;
	instantLoad = false;
	premultipliedAlpha = false;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"sourceNode",
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
		const sourceNode = this.__getValue(this.sourceNode);
        this.width = sourceNode.width;
        this.height = sourceNode.height;
        this.__checkPowerOfTwo();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
    }
    load() {
		const sourceNode = this.__getValue(this.sourceNode);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.__getValue(this.premultipliedAlpha));
        switch(sourceNode.constructor.name) {
            case "ImageBitmap":
            {
                const canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(sourceNode, 0, 0);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
                this.generateMipmap();
                break;
            }
            case "SilverRainImageNode":
            {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, sourceNode.image);
                this.generateMipmap();
                break;
            }
            case "SilverRainVideoNode":
            {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, sourceNode.video);
                this.generateMipmap();
                break;
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
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

export {SilverRainTextureNode};
