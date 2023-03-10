// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainAtlasNode
// ----------------------------------------------

import {SilverRainBaseTextureNode} from './SilverRainBaseTextureNode.js';

class SilverRainAtlasNode extends SilverRainBaseTextureNode {
	// Input
	imageSrc = undefined;
	jsonSrc = undefined;
	request = {};
	// Global
	image = new Image();
	data = new Map();
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"imageSrc",
			"jsonSrc",
			"request"
		]);
    }
    async load() {
		return Promise.all([this.__loadImage(), this.__loadJson()])
		.then(() => {
			this.__init();
		});
	}
	async __loadJson() {
		const jsonSrc = this.__getValue(this.jsonSrc);
		const request = this.__getValue(this.request);
        return new Promise((ok, error) => {
			fetch(jsonSrc, request)
			.then(response => response.json())
			.then((json) => {
				this.__processJson(json);
				ok(this);
			})
			.catch((e) => {
				console.error(e);
				error(new Error(this.__errorMessage(jsonSrc)));
			});
		});
	}
    async __loadImage() {
		const imageSrc = this.__getValue(this.imageSrc);
		const request = this.__getValue(this.request);
        return new Promise((ok, error) => {
			fetch(imageSrc, request)
			.then(response => response.blob())
			.then((blob) => {
				const objectURL = URL.createObjectURL(blob);
				this.image.onload = () => {
					URL.revokeObjectURL(objectURL);
					ok(this);
				};
				this.image.onerror = (e) => {
					console.error(e);
					error(new Error(this.__errorMessage(imageSrc)));
				};
				this.image.src = objectURL;
			})
			.catch((e) => {
				console.error(e);
				error(new Error(this.__errorMessage(imageSrc)));
			});
		});
    }
    __processJson(aJson) {
		for(const frame of aJson.frames) {
			const obj = {
				width: frame.frame.w,
				height: frame.frame.h,
				x: frame.frame.x,
				y: frame.frame.y,
				rotated: frame.rotated,
			};
			this.data.set(frame.filename, obj);
		}
	}
    __errorMessage(aMsg) {
		return `Error loading file '${aMsg}'`;
	}
    __init() {
        this.width = this.image.width;
        this.height = this.image.height;
        this.__checkPowerOfTwo();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultipliedAlpha);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
		this.generateMipmap();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}

export {SilverRainAtlasNode};
