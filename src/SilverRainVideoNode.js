// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainVideoNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainVideoNode extends SilverRainBaseNode {
	// Input
	src = undefined;
	crossOrigin = "anonymous";
	// Global
	video = undefined;
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"src",
			"crossOrigin",
		]);
        this.video = document.createElement("video");
        this.video.crossOrigin = this.crossOrigin;
        this.video.preload = "auto";
	}
    async load() {
        return new Promise((resolve, reject) => {
            this.video.addEventListener("canplaythrough", () => {
                resolve(this);
            }, false);
            this.video.addEventListener("error", () => {
                reject(new Error(`Video file loading error '${this.src}'`));
            }, false);
            this.video.src = this.src;
        });
    }
    get width() {return this.video.videoWidth;}
    get height() {return this.video.videoHeight;}
}

export {SilverRainVideoNode};
