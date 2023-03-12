// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//             SilverRainSdfFontNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainSdfFontNode extends SilverRainBaseNode {
	// Input
	imageSrc = undefined;
	jsonSrc = undefined;
	request = {};
	// Global
	data = {
		chars: new Map(),
		info: {}
	};
	texture = undefined;
	width = undefined;
	height = undefined;
	// Local
	__image = new Image();
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"imageSrc",
			"jsonSrc",
			"request"
		]);
        this.texture = this.gl.createTexture();
    }
    async load() {
		return Promise.all([this.__loadImage(), this.__loadJson()])
		.then(() => {
			this.__init();
			this.__image = undefined;
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
				this.__image.onload = () => {
					URL.revokeObjectURL(objectURL);
					ok(this);
				};
				this.__image.onerror = (e) => {
					console.error(e);
					error(new Error(this.__errorMessage(imageSrc)));
				};
				this.__image.src = objectURL;
			})
			.catch((e) => {
				console.error(e);
				error(new Error(this.__errorMessage(imageSrc)));
			});
		});
    }
    __errorMessage(aMsg) {
		return `Error loading file '${aMsg}'`;
	}
    __init() {
        this.width = this.__image.width;
        this.height = this.__image.height;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.__image);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
    __processJson(aJson) {
		const idList = new Map();
		for(const c of aJson.chars) {
			idList.set(c.id, c.char);
		}
		const kList = new Map();
		for(const char of aJson.chars) {
			const ker = new Map();
			for(const kerning of aJson.kernings) {
				if(char.id === kerning.first) {
					if(idList.has(kerning.second)) {
						ker.set(idList.get(kerning.second), kerning.amount);
					}
				}
			}
			kList.set(char.char, ker);
		}
		for(const c of aJson.chars) {
			this.data.chars.set(c.char, {
				width: c.width,
				height: c.height,
				offsetX: c.xoffset,
				offsetY: c.yoffset,
				x: c.x,
				y: c.y,
				advance: c.xadvance,
				kerning: kList.get(c.char)
			});
			this.data.info.size = aJson.info.size;
			this.data.info.base = aJson.common.base;
			this.data.info.type = aJson.distanceField.fieldType;
		}
	}
}

export {SilverRainSdfFontNode};
