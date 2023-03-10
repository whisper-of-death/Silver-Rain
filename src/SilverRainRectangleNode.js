// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//            SilverRainRectangleNode
// ----------------------------------------------

import {SilverRainBase3dNode} from './SilverRainBase3dNode.js';

class SilverRainRectangleNode extends SilverRainBase3dNode {
	width = 100;
	height = 100;
	color = [0.5,0.5,0.5,1];
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"width",
			"height",
			"color"
		]);
		this.draw();
    }
    draw() {
		const width = this.__getValue(this.width);
		const height = this.__getValue(this.height);
		const color = this.__getValue(this.color);
		this.__clearMaterial("Rectangle");
		this.__setMaterial({name: "Rectangle", diffuseColor: color});
		this.__addTriangle({material: "Rectangle", v1: [0, 0, 0], v2: [width, 0, 0], v3: [0, height, 0]});
		this.__addTriangle({material: "Rectangle", v1: [width, 0, 0], v2: [width, height, 0], v3: [0, height, 0]});
		this.__compile();
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}

export {SilverRainRectangleNode};
