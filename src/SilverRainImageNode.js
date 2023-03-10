// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainImageNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainImageNode extends SilverRainBaseNode {
	// Input
	src = undefined;
	request = {};
	// Global
	image = new Image();
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"src",
			"request",
		]);
    }
    async load() {
		const src = this.__getValue(this.src);
		const request = this.__getValue(this.request);
        return new Promise((ok, error) => {
			fetch(src, request)
			.then(response => response.blob())
			.then((blob) => {
				const objectURL = URL.createObjectURL(blob);
				this.image.onload = () => {
					URL.revokeObjectURL(objectURL);
					ok(this);
				};
				this.image.onerror = (e) => {
					console.error(e);
					error(new Error(this.__errorMessage(src)));
				};
				this.image.src = objectURL;
			})
			.catch((e) => {
				console.error(e);
				error(new Error(this.__errorMessage(src)));
			});
		});
    }
    __errorMessage(aMsg) {
		return `Error loading file '${aMsg}'`;
	}
    free() {
		this.image = null;
		return this;
	}
    get width() {return this.image.width;}
    get height() {return this.image.height;}
}

export {SilverRainImageNode};
