// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainCameraNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Mat4, Vec3, Quat} from './SilverRainMath.js';

class SilverRainCameraNode extends SilverRainBaseNode {
	// Input
	position = undefined;
	target = undefined;
	up = undefined;
	coordSystem = "left";
	instantCalc = false;
	// Global
	xAxis = undefined;
	yAxis = undefined;
	zAxis = undefined;
	lookatMatrix = undefined;
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"position",
			"target",
			"up",
			"coordSystem",
			"instantCalc"
		]);
        if(this.__getValue(this.enable) && this.__getValue(this.instantCalc)) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
    calculate() {
		const input = {
			position: this.__getValue(this.position),
			target: this.__getValue(this.target),
			up: this.__getValue(this.up),
			coordSystem: this.__getValue(this.coordSystem),
		}
		if(input.coordSystem.toLowerCase() === "right") {
			this.zAxis = Vec3.normalize(Vec3.subtract(input.position, input.target));
		} else {
			this.zAxis = Vec3.normalize(Vec3.subtract(input.target, input.position));
		}
		this.xAxis = Vec3.normalize(Vec3.cross(input.up, this.zAxis));
		this.yAxis = Vec3.normalize(Vec3.cross(this.zAxis, this.xAxis));
		const tx = -Vec3.dot(this.xAxis, input.position);
		const ty = -Vec3.dot(this.yAxis, input.position);
		const tz = -Vec3.dot(this.zAxis, input.position);
		this.lookatMatrix = Mat4.null();
		this.lookatMatrix[0] = this.xAxis[0];
		this.lookatMatrix[1] = this.xAxis[1];
		this.lookatMatrix[2] = this.xAxis[2];
		this.lookatMatrix[3] = tx;
		this.lookatMatrix[4] = this.yAxis[0];
		this.lookatMatrix[5] = this.yAxis[1];
		this.lookatMatrix[6] = this.yAxis[2];
		this.lookatMatrix[7] = ty;
		this.lookatMatrix[8] = this.zAxis[0];
		this.lookatMatrix[9] = this.zAxis[1];
		this.lookatMatrix[10] = this.zAxis[2];
		this.lookatMatrix[11] = tz;
		this.lookatMatrix[15] = 1;
	}
	__rotate(aAxis, aAngle) {
		const quat = Quat.setAxisAngle(aAxis, aAngle);
		this.xAxis = Vec3.normalize(Quat.rotate(this.xAxis, quat));
		this.yAxis = Vec3.normalize(Quat.rotate(this.yAxis, quat));
		this.zAxis = Vec3.normalize(Quat.rotate(this.zAxis, quat));
		const len = Vec3.length(Vec3.subtract(this.target, this.position));
		this.target = Vec3.add(this.position, Vec3.scale(this.zAxis, len));
		this.up = Vec3.normalize(Quat.rotate(this.up, quat));
	}
	rotateX(aAngle) {
		this.__rotate(this.xAxis, aAngle);
		return this;
	}
	rotateY(aAngle) {
		this.__rotate(this.yAxis, aAngle);
		return this;
	}
	rotateZ(aAngle) {
		this.__rotate(this.zAxis, aAngle);
		return this;
	}
	translateX(aDist) {
		this.position = Vec3.add(this.position, Vec3.scale(this.xAxis, aDist));
		this.target = Vec3.add(this.target, Vec3.scale(this.xAxis, aDist));
		return this;
	}
	translateY(aDist) {
		this.position = Vec3.add(this.position, Vec3.scale(this.yAxis, aDist));
		this.target = Vec3.add(this.target, Vec3.scale(this.yAxis, aDist));
		return this;
	}
	translateZ(aDist) {
		this.position = Vec3.add(this.position, Vec3.scale(this.zAxis, aDist));
		this.target = Vec3.add(this.target, Vec3.scale(this.zAxis, aDist));
		return this;
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
}

export {SilverRainCameraNode};
