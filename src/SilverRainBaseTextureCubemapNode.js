// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//         SilverRainBaseTextureCubemapNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainBaseTextureCubemapNode extends SilverRainBaseNode {
	// Input
	mipmap = true;
	minFilter = "linear";
	magFilter = "linear";
	wrapS = "clampToEdge";
	wrapT = "clampToEdge";
	// Global
	texture = undefined;
	width = undefined;
	height = undefined;
	// Local
	__powerOfTwo = undefined;

	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"mipmap",
			"minFilter",
			"magFilter",
			"wrapS",
			"wrapT"
		]);
        this.texture = this.gl.createTexture();
    }

    free() {
		this.gl.deleteTexture(this.texture);
		return this;
	}

    generateMipmap() {
        if(this.__getValue(this.mipmap)) {
			if(this.root.webglVersion === 2) {
				this.__generateMipmap();
			} else {
				if(this.__powerOfTwo) {
					this.__generateMipmap();
				}
			}
        }
        return this;
    }

    __generateMipmap() {
		this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
		this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
		this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
	}

    /*
    __isTextureNode(argNode) {
        return SilverRainBaseNode.prototype.isPrototypeOf(argNode);
    }
    */

    __isPowerOfTwo(argValue) {
        return argValue && !(argValue & (argValue - 1));
    }

    __checkPowerOfTwo() {
        if(this.__isPowerOfTwo(this.width) && this.__isPowerOfTwo(this.height)) {
            this.__powerOfTwo = true;
        } else {
            this.__powerOfTwo = false;
        }
    }

    __setMinFilter() {
        let minFilter;
        switch(this.__getValue(this.minFilter).toLowerCase()) {
            case "linear": {minFilter = this.gl.LINEAR; break;}
            case "nearest": {minFilter = this.gl.NEAREST; break;}
            case "nearestmipmapnearest": {minFilter = this.gl.NEAREST_MIPMAP_NEAREST; break;}
            case "linearmipmapnearest": {minFilter = this.gl.LINEAR_MIPMAP_NEAREST; break;}
            case "nearestmipmaplinear": {minFilter = this.gl.NEAREST_MIPMAP_LINEAR; break;}
            case "linearmipmaplinear": {minFilter = this.gl.LINEAR_MIPMAP_LINEAR; break;}
            case "nearestmipmaplinear": {minFilter = this.gl.NEAREST_MIPMAP_LINEAR; break;}
			default: {this.__error("Invalid minification filter");}
        }
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, minFilter);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }

    __setMagFilter() {
        let magFilter;
        switch(this.__getValue(this.magFilter).toLowerCase()) {
            case "nearest": {magFilter = this.gl.NEAREST; break;}
            case "linear": {magFilter = this.gl.LINEAR; break;}
			default: {this.__error("Invalid magnification filter");}
        }
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, magFilter);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }

    __setWrapS() {
        let wrapS;
		switch(this.__getValue(this.wrapS).toLowerCase()) {
			case "clamptoedge": {wrapS = this.gl.CLAMP_TO_EDGE; break;}
			case "mirroredrepeat": {wrapS = this.gl.MIRRORED_REPEAT; break;}
			case "repeat": {wrapS = this.gl.REPEAT; break;}
			default: {this.__error("Invalid wrapping function for texture coordinate S");}
		}
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, wrapS);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }

    __setWrapT() {
        let wrapT;
		switch(this.__getValue(this.wrapT).toLowerCase()) {
			case "clamptoedge": {wrapT = this.gl.CLAMP_TO_EDGE; break;}
			case "mirroredrepeat": {wrapT = this.gl.MIRRORED_REPEAT; break;}
			case "repeat": {wrapT = this.gl.REPEAT; break;}
			default: {this.__error("Invalid wrapping function for texture coordinate T");}
		}
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, wrapT);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }

	set magFilter(argValue) {this.magFilter = argValue; this.__setMagFilter();}
	set minFilter(argValue) {this.minFilter = argValue; this.__setMinFilter();}
	set wrapS(argValue) {this.wrapS = argValue; this.__setWrapS();}
	set wrapT(argValue) {this.wrapT = argValue; this.__setWrapT();}
}

export {SilverRainBaseTextureCubemapNode};
