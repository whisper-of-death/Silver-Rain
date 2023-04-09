// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainCube3dNode
// ----------------------------------------------

import {SilverRainBase3dNode} from './SilverRainBase3dNode.js';

class SilverRainCube3dNode extends SilverRainBase3dNode {

	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__init();
		/*
		this.__loadArguments(argObject, [
		]);
		*/
    }

    __init() {
		this.__setMaterial({name: "frontFace", diffuseColor: [1,0,0,1]});
		this.__setMaterial({name: "rightFace", diffuseColor: [0,0,1,1]});
		this.__setMaterial({name: "leftFace", diffuseColor: [0,1,1,1]});
		this.__setMaterial({name: "backFace", diffuseColor: [1,1,0,1]});
		this.__setMaterial({name: "topFace", diffuseColor: [0,0,0,1]});
		this.__setMaterial({name: "bottomFace", diffuseColor: [1,0,1,1]});
		this.__addTriangle({material: "frontFace", v1: [-0.5, -0.5, -0.5], v2: [0.5, -0.5, -0.5], v3: [0.5, 0.5, -0.5]});
		this.__addTriangle({material: "frontFace", v1: [-0.5, -0.5, -0.5], v2: [0.5, 0.5, -0.5], v3: [-0.5, 0.5, -0.5]});
		this.__addTriangle({material: "rightFace", v1: [0.5, -0.5, -0.5], v2: [0.5, -0.5, 0.5], v3: [0.5, 0.5, 0.5]});
		this.__addTriangle({material: "rightFace", v1: [0.5, -0.5, -0.5], v2: [0.5, 0.5, 0.5], v3: [0.5, 0.5, -0.5]});
		this.__addTriangle({material: "leftFace", v1: [-0.5, -0.5, 0.5], v2: [-0.5, -0.5, -0.5], v3: [-0.5, 0.5, -0.5]});
		this.__addTriangle({material: "leftFace", v1: [-0.5, -0.5, 0.5], v2: [-0.5, 0.5, -0.5], v3: [-0.5, 0.5, 0.5]});
		this.__addTriangle({material: "backFace", v1: [0.5, -0.5, 0.5], v2: [-0.5, -0.5, 0.5], v3: [-0.5, 0.5, 0.5]});
		this.__addTriangle({material: "backFace", v1: [0.5, -0.5, 0.5], v2: [-0.5, 0.5, 0.5], v3: [0.5, 0.5, 0.5]});
		this.__addTriangle({material: "topFace", v1: [-0.5, 0.5, -0.5], v2: [0.5, 0.5, -0.5], v3: [0.5, 0.5, 0.5]});
		this.__addTriangle({material: "topFace", v1: [-0.5, 0.5, -0.5], v2: [0.5, 0.5, 0.5], v3: [-0.5, 0.5, 0.5]});
		this.__addTriangle({material: "bottomFace", v1: [0.5, -0.5, 0.5], v2: [-0.5, -0.5, 0.5], v3: [-0.5, -0.5, -0.5]});
		this.__addTriangle({material: "bottomFace", v1: [0.5, -0.5, 0.5], v2: [-0.5, -0.5, -0.5], v3: [0.5, -0.5, -0.5]});
		this.__compile();
	}

}

export {SilverRainCube3dNode};
