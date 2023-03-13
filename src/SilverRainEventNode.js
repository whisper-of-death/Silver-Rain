// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainEventNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';
import {Vec3} from './SilverRainMath.js';

class SilverRainEventNode extends SilverRainBaseNode {
	// Input
	cullFace = "none";
	coordSystem = "left";
	// Global
	// Local
	__compFunc = undefined;
	__compFuncInverse = undefined;
	__object = new Map();
	__objects = [];
	__objectsId = [];
	__event = {
		over: {up: new Map(), down: new Map()},
		down: {up: new Map(), down: new Map()},
		move: {up: new Map(), down: new Map()},
		up: {up: new Map(), down: new Map()},
		out: {up: new Map(), down: new Map()},
		wheel: {up: new Map(), down: new Map()},
	}
	__cursorStyle = new Map();
	__aElement = document.createElement("a");
	__touch = {
		move: false,
		x: undefined,
		y: undefined
	};
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"cullFace",
			"coordSystem"
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
    __setData(argData) {
        this.__object.set(argData.id, {needDelete: false, data: argData.data});
    }
    __update() {
        if(this.__getValue(this.enable)) {
			this.__setup();
			this.__clear();
			this.__cleanup();
		}
    }
    __init() {
		this.gl.canvas.addEventListener("pointerdown", (e) => {
			if(!this.__getValue(this.enable)) {return;}
			this.__run({
				event: e,
				eventName: "down"
			});
		}, false);
		this.gl.canvas.addEventListener("pointerup", (e) => {
			if(!this.__getValue(this.enable)) {return;}
			this.__run({
				event: e,
				eventName: "up"
			});
		}, false);
		this.gl.canvas.addEventListener("pointermove", (e) => {
			if(!this.__getValue(this.enable)) {return;}
			const position = this.__getPointerPosition(e, true);
			const coords = this.__getCoords(position);
			const objects = this.__getObjects(coords).sort(this.__compFunc);
            const objectsId = objects.map(function(e) {return e.id;});
			const overObjects = objects.filter(v => !this.__objectsId.includes(v.id));
            const outObjects = this.__objects.filter(v => !objectsId.includes(v.id));
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
// 		console.log(aData.eventName, objects);
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
