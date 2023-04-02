// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//               SilverRainEventNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Vec3} from './SilverRainMath.js';

class SilverRainEventNode extends SilverRainBaseNode {
	// Input
	cullFace = "none";
	coordSystem = "left";
	deltaX = 1;
	deltaY = 1;
	// Global
	// Local
	__compFunc = undefined;
	__compFuncInverse = undefined;
	__object = new Map();
	__objects = [];
	__objectsId = [];
	__event = {
		click: {up: new Map(), down: new Map()},
		touchmove: {up: new Map(), down: new Map()},
		over: {up: new Map(), down: new Map()},
		down: {up: new Map(), down: new Map()},
		move: {up: new Map(), down: new Map()},
		up: {up: new Map(), down: new Map()},
		out: {up: new Map(), down: new Map()},
		wheel: {up: new Map(), down: new Map()},
	}
	__cursorStyle = new Map();
	__aElement = document.createElement("a");
	__status = {
		leftButtonDown: false,
		move: false,
		x: 0,
		y: 0,
		movementX: 0,
		movementY: 0
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"cullFace",
			"coordSystem",
			"deltaX",
			"deltaY",
		]);
		this.__setCompFunc();
		this.__init();
	}
	__setCompFunc() {
		if(this.__getValue(this.coordSystem).toLowerCase() === "right") {
			this.__compFunc = (a, b) => b.z - a.z;
			this.__compFuncInverse = (a, b) => a.z - b.z;
		} else {
			this.__compFunc = (a, b) => a.z - b.z;
			this.__compFuncInverse = (a, b) => b.z - a.z;
		}
	}
    addEventListener(aData) {
        const eventData = this.__event[aData.event.toLowerCase()];
		if(!eventData) {
			this.__error(`Unknown event type '${aData.event}'`);
		}
		const eventSubdata = (aData.phase.toLowerCase() === "down") ? eventData.down : eventData.up;
		let id;
		if(Object.hasOwn(aData, "id")) {
			id = aData.id;
		} else {
			id = aData.object.id;
		}
        const func = aData.func
        const setFunc = (id) => {
            if(!eventSubdata.has(id)) {
                eventSubdata.set(id, new Set());
            }
            eventSubdata.get(id).add(func);
        }
        if(typeof id === "object") {
            for(const element of Array.from(id)) {
                setFunc(element);
            }
        } else {
            setFunc(id);
        }
        return this;
    }
    removeEventListener(aData) {
        const eventData = this.__event[aData.event.toLowerCase()];
		if(!eventData) {
			this.__error(`Unknown event type '${aData.event}'`);
		}
		const eventSubdata = (aData.phase.toLowerCase() === "down") ? eventData.down : eventData.up;
		let id;
		if(Object.hasOwn(aData, "id")) {
			id = aData.id;
		} else {
			id = aData.object.id;
		}
        const func = aData.func
		const removeFunc = (id) => {
            if(eventSubdata.has(id)) {
				const set = eventSubdata.get(id);
				set.delete(func);
				if(set.size === 0) {
					eventSubdata.delete(id);
				}
			}
		}
        if(typeof id === "object") {
            for(const element of Array.from(id)) {
                removeFunc(element);
            }
        } else {
            removeFunc(id);
        }
        return this;
	}
    __setData(argData) {
		const r1 = this.__triangleInCube(argData.data.t1);
		const r2 = this.__triangleInCube(argData.data.t2);
		if(r1 && r2) {
			this.__object.set(argData.id, {needDelete: false, data: argData.data});
		}
    }
    __triangleInCube(aTriangle) {
		const v0 = [aTriangle.v0[0], aTriangle.v0[1], aTriangle.v0[2]];
		const v1 = [aTriangle.v1[0], aTriangle.v1[1], aTriangle.v1[2]];
		const v2 = [aTriangle.v2[0], aTriangle.v2[1], aTriangle.v2[2]];
		const e0 = Vec3.subtract(v1, v0);
		const e1 = Vec3.subtract(v2, v1);
		const e2 = Vec3.subtract(v0, v2);
		const normal = Vec3.cross(e0, e1);
		const triangleVertices = [v0, v1, v2];
		const triangleEdges = [e0, e1, e2];
		const maxX = Math.max(v0[0], v1[0], v2[0]);
		const minX = Math.min(v0[0], v1[0], v2[0]);
		const maxY = Math.max(v0[1], v1[1], v2[1]);
		const minY = Math.min(v0[1], v1[1], v2[1]);
		const boxVertices = [
			[-1,-1,-1],
			[1,-1,-1],
			[1,1,-1],
			[-1,1,-1],
			[-1,-1,1],
			[1,-1,1],
			[1,1,1],
			[-1,1,1]
		];
		const boxNormals = [
			[1,0,0],
			[0,1,0],
			[0,0,1],
		];

		// 1 stage
		const checkZ = [v0[2], v1[2], v2[2]].some(e => e > 1 || e < -1);
		if(minX > 1 || maxX < -1 || minY > 1 || maxY < -1 || checkZ) {
			return false;
		}
		// 2 stage
		const offset = Vec3.dot(normal, v0);
		const p = boxVertices.map(e => Vec3.dot(e, normal));
		const boxMax = Math.max(...p);
		const boxMin = Math.min(...p);
		if(offset > boxMax || offset < boxMin) {
			return false;
		}
		// 3 stage
		for(const triangleEdge of triangleEdges) {
			for(const boxNormal of boxNormals) {
				const axis = Vec3.cross(boxNormal, triangleEdge);
				const boxV = boxVertices.map(e => Vec3.dot(e, axis));
				const triV = triangleVertices.map(e => Vec3.dot(e, axis));
				const boxMax = Math.max(...boxV);
				const boxMin = Math.min(...boxV);
				const triangleMax = Math.max(...triV);
				const triangleMin = Math.min(...triV);
				if(triangleMin > boxMax || triangleMax < boxMin) {
					return false;
				}
			}
		}
		return true;
	}
    __update() {
        if(this.__getValue(this.enable)) {
			this.__setup();
			this.__clear();
			this.__cleanup();
		}
    }
    __init() {
		this.gl.canvas.addEventListener("pointerout", (e) => {
			this.__status.leftButtonDown = false;
			this.__status.move = false;
		}, false);
		this.gl.canvas.addEventListener("pointerdown", (e) => {
			if(!this.__getValue(this.enable)) {return;}
			this.__run({
				event: e,
				eventName: "down"
			});
			if(e.button === 0) {
				this.__status.leftButtonDown = true;
				this.__status.clientX = e.clientX;
				this.__status.clientY = e.clientY;
				this.__status.movementX = 0;
				this.__status.movementY = 0;
			}
			this.__status.move = false;
		}, false);
		this.gl.canvas.addEventListener("pointerup", (e) => {
			if(!this.__getValue(this.enable)) {return;}
			this.__run({
				event: e,
				eventName: "up"
			});
			if(this.__status.leftButtonDown && !this.__status.move) {
				this.__run({
					event: e,
					eventName: "click",
				});
			}
			this.__status.leftButtonDown = false;
			this.__status.move = false;
		}, false);
		this.gl.canvas.addEventListener("pointermove", (e) => {
			const input = {
				deltaX: this.__getValue(this.deltaX),
				deltaY: this.__getValue(this.deltaY),
				enable: this.__getValue(this.enable),
			};
			if(!input.enable) {return;}
			const position = this.__getPointerPosition(e, true);
			const coords = this.__getCoords(position);
			const objects = this.__getObjects(coords).sort(this.__compFunc);
            const objectsId = objects.map(function(e) {return e.id;});
			const overObjects = objects.filter(v => !this.__objectsId.includes(v.id));
            const outObjects = this.__objects.filter(v => !objectsId.includes(v.id));
			const movementX = e.clientX - this.__status.clientX;
			const movementY = e.clientY - this.__status.clientY;
			this.__status.clientX = e.clientX;
			this.__status.clientY = e.clientY;
			if(this.__status.leftButtonDown) {
				this.__status.movementX += movementX;
				this.__status.movementY += movementY;
				if(Math.abs(movementX) > input.deltaX || Math.abs(movementY) > input.deltaY) {
					this.__status.move = true;
				}
				if(Math.abs(this.__status.movementX) > input.deltaX || Math.abs(this.__status.movementY) > input.deltaY) {
					this.__status.move = true;
				}
				if(this.__status.move) {
					this.__run({
						event: e,
						eventName: "touchmove",
						objects: objects,
						position: position,
						properties: {
							deltaX: movementX,
							deltaY: movementY,
						}
					});
				}
			}
            let styleCursor = undefined;
			if(outObjects.length > 0) {
				styleCursor = "default";
			}
            for(const object of objects) {
                if(this.__cursorStyle.has(object.id)) {
                    styleCursor = this.__cursorStyle.get(object.id);
					break;
                }
            }
            for(const object of overObjects) {
                if(this.__cursorStyle.has(object.id)) {
                    styleCursor = this.__cursorStyle.get(object.id);
					break;
                }
            }
			if(styleCursor) {
				this.gl.canvas.style.cursor = styleCursor;
			}
            if(objects.length > 0) {
				this.__run({
					event: e,
					eventName: "move",
					objects: objects,
					position: position
				});
			}
			if(outObjects.length > 0) {
				this.__run({
					event: e,
					eventName: "out",
					objects: outObjects,
					position: position
				});
			}
			if(overObjects.length > 0) {
				this.__run({
					event: e,
					eventName: "over",
					objects: overObjects,
					position: position
				});
			}
            this.__objects = objects;
            this.__objectsId = objectsId;
		}, false);
        this.gl.canvas.addEventListener("wheel", (e) => {
			if(!this.__getValue(this.enable)) {return;}
            this.__run({
                event: e,
                eventName: "wheel",
                properties: {
                    deltaY: e.deltaY
                }
            });
        }, false);
    }
    __run(aData) {
        const eventData = this.__event[aData.eventName];
		let position, objects;
		if(Object.hasOwn(aData, "position")) {
			position = aData.position;
		} else {
			position = this.__getPointerPosition(aData.event, true);
		}
		if(Object.hasOwn(aData, "objects")) {
			objects = aData.objects;
		} else {
			const coords = this.__getCoords(position);
			objects = this.__getObjects(coords);
		}
		if(objects.length === 0) {
			return;
		}
        objects.sort(this.__compFunc);
        let stopProp = false;
        for(const object of objects) {
            if(eventData.down.has(object.id)) {
                const set = eventData.down.get(object.id);
                const eventObject = {
                    event: aData.event,
                    eventName: aData.eventName,
                    objectId: object.id,
                    phase: "down",
                    u: object.u,
                    v: object.v,
                    canvasX: position.x,
                    canvasY: position.y,
                    coordX: object.x,
                    coordY: object.y,
                    coordZ: object.z,
                    stopPropagation: () => {stopProp = true;},
                };
                if(aData.hasOwnProperty("properties")) {
                    Object.assign(eventObject, aData.properties);
                }
                for(const func of set) {
                    func.call(this, eventObject);
                }
            }
            if(stopProp) {
                break;
            }
        }
        if(!stopProp) {
			objects.sort(this.__compFuncInverse);
            for(const object of objects) {
                if(eventData.up.has(object.id)) {
                    const set = eventData.up.get(object.id);
                    const eventObject = {
                        event: aData.event,
                        eventName: aData.eventName,
                        objectId: object.id,
                        phase: "up",
                        u: object.u,
                        v: object.v,
                        canvasX: position.x,
                        canvasY: position.y,
                        coordX: object.x,
                        coordY: object.y,
                        coordZ: object.z,
                        stopPropagation: () => {stopProp = true;},
                    };
                    if(aData.hasOwnProperty("properties")) {
                        Object.assign(eventObject, aData.properties);
                    }
                    for(const func of set) {
                        func.call(this, eventObject);
                    }
                }
                if(stopProp) {
                    break;
                }
            }
        }
    }
    setCursorStyle(aData) {
		if(Reflect.has(aData, "id")) {
			const id = this.__getValue(aData.id);
			if(this.__getType(id) === "array") {
				for(const _id of id) {
					this.__cursorStyle.set(_id, aData.cursor);
				}
			} else {
				this.__cursorStyle.set(id, aData.cursor);
			}
			return this;
		}
		if(Reflect.has(aData, "object")) {
			const object = this.__getValue(aData.object);
			if(this.__getType(object) === "array") {
				for(const _object of object) {
					this.__cursorStyle.set(_object.id, aData.cursor);
				}
			} else {
				this.__cursorStyle.set(object.id, aData.cursor);
			}
			return this;
		}
        return this;
    }
    removeCursorStyle(aData) {
		if(Reflect.has(aData, "id")) {
			const id = this.__getValue(aData.id);
			if(this.__getType(id) === "array") {
				for(const _id of id) {
					this.__cursorStyle.delete(_id);
				}
			} else {
				this.__cursorStyle.delete(id);
			}
			return this;
		}
		if(Reflect.has(aData, "object")) {
			const object = this.__getValue(aData.object);
			if(this.__getType(object) === "array") {
				for(const _object of object) {
					this.__cursorStyle.delete(_object.id);
				}
			} else {
				this.__cursorStyle.delete(object.id);
			}
			return this;
		}
// 		const id = (Object.hasOwn(argData, "id")) ? argData.id : argData.object.id;
// 		this.__cursorStyle.delete(id);
        return this;
	}
    link(argData) {
        let target;
        if(["_blank", "_self", "_parent", "_top"].includes(argData.target)) {
            target = argData.target;
        } else {
            target = "_self";
        }
        this.__aElement.target = target;
        this.__aElement.href = argData.url;
        this.__aElement.click();
    }
    __clear() {
        for(const [key, value] of this.__object) {
            if(value.needDelete) {
                this.__object.delete(key);
            }
        }
        this.__object.forEach((value) => {
            value.needDelete = true;
        });
    }
    __getPointerPosition(event, swapY = false) {
        const rect = event.target.getBoundingClientRect();
        if(swapY === true) {
            return {
                x: event.clientX - rect.left,
                y: event.target.height - (event.clientY - rect.top)
            };
        } else {
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
    }
    __getCoords(argMousePosition) {
        const x = 2 * argMousePosition.x / this.gl.canvas.width - 1;
        const y = 2 * argMousePosition.y / this.gl.canvas.height - 1;
        return {x: x, y: y};
    }
    __getObjects(coords) {
        const x = coords.x;
        const y = coords.y;
        const objects = [];
        for(const [key, object] of this.__object) {
            const data = object.data;
            let res = this.__checkTriangle({
                type: 1,
                x: coords.x,
                y: coords.y,
                v0: data.t1.v0,
                v1: data.t1.v1,
                v2: data.t1.v2,
            });
            if(res) {
                objects.push({id: key, u: res.u, v: res.v, x: res.x, y: res.y, z: res.z});
                continue;
            }
            res = this.__checkTriangle({
                type: 2,
                x: coords.x,
                y: coords.y,
                v0: data.t2.v0,
                v1: data.t2.v1,
                v2: data.t2.v2,
            });
            if(res) {
                objects.push({id: key, u: res.u, v: res.v, x: res.x, y: res.y, z: res.z});
            }
        }
        return objects;
    }
    __checkTriangle(argData) {
        const epsilon =1e-8;
        const originZ = -10;
        const origin = [argData.x, argData.y, originZ];
        const T = Vec3.subtract(origin, argData.v0);
        const D = Vec3.normalize([argData.x, argData.y, 1e8]);
        const E1 = Vec3.subtract(argData.v1, argData.v0);
        const E2 = Vec3.subtract(argData.v2, argData.v0);
        const P = Vec3.cross(D, E2);
        const Q = Vec3.cross(T, E1);
        const det = Vec3.dot(P, E1);
        if(Math.abs(det) < epsilon) {
            return false;
        }
        const cullFace = this.__getValue(this.cullFace);
        switch(cullFace.toLowerCase()) {
            case "front":
                if(det < 0) {
                    return false;
                }
                break;
            case "back":
                if(det > 0) {
                    return false;
                }
                break;
        };
        let u = Vec3.dot(P, T) / det;
        let v = Vec3.dot(Q, D) / det;
        const t = Vec3.dot(Q, E2) / det;
        if(u < 0 || v < 0 || u + v > 1) {
            return false;
        }
        if(argData.type == 2) {
            u = 1 - u;
            v = 1 - v;
        }
        const p = Vec3.add(origin, Vec3.scale(D, t));
        return {u: u, v: v, t: t, x: p[0], y: p[1], z: p[2]};
    }

}

export {SilverRainEventNode};
