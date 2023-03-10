// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainEaseNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainEaseNode extends SilverRainBaseNode {
	// Input
	data = undefined;
	autoStart = false;
	onAbort = undefined;
	onPause = undefined;
	onResume = undefined;
	// Local
	__controller = undefined;
	__startTime = undefined;
	__passedTime = undefined;
	__timeline = undefined;
	__value = 0;
	__actualValue = 0;
	__status = "stop";
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"data",
			"autoStart",
			"onAbort",
			"onPause",
			"onResume"
		]);
        if(this.__getValue(this.enable) && this.__getValue(this.autoStart)) {
            this.__setup();
            this.start();
            this.__cleanup();
        }
	}
	start() {
		if(this.__status === "stop") {
			this.restart();
		}
	}
	restart() {
		this.__clearVar();
		this.__status = "run";
		this.__processList(this.data)
		.then(() => {
			this.__status = "stop";
		})
		.catch(() => {});
	}
	abort() {
		if(this.__status === "run" || this.__status === "pause") {
			if(typeof this.__controller === "function") {
				this.__controller("abort");
			}
		}
	}
	pause() {
		if(this.__status === "run") {
			if(typeof this.__controller === "function") {
				this.__controller("pause");
			}
		}
	}
	resume() {
		if(this.__status === "pause") {
			if(typeof this.__controller === "function") {
				this.__controller("resume");
			}
		}
	}
	break() {
		if(this.__status === "run") {
			if(typeof this.__controller === "function") {
				this.__controller("break");
			}
		}
	}
	__disableControllers() {
		this.__controller = undefined;
		this.__timeline = undefined;
	}
	__clearVar() {
		this.__disableControllers();
		this.__value = 0;
		this.__actualValue = 0;
	}
	__dispatchEvent(argName, argElement, argParams = {}) {
		argParams.element = argElement;
		switch(argName) {
			case "start": {
				if(this.__getType(argElement.onStart) === "function") {
					argElement.onStart.call(this, argParams);
				}
				break;
			}
			case "end": {
				if(this.__getType(argElement.onEnd) === "function") {
					argElement.onEnd.call(this, argParams);
				}
				break;
			}
			case "startIteration": {
				if(this.__getType(argElement.onStartIteration) === "function") {
					argElement.onStartIteration.call(this, argParams);
				}
				break;
			}
			case "endIteration": {
				if(this.__getType(argElement.onEndIteration) === "function") {
					argElement.onEndIteration.call(this, argParams);
				}
				break;
			}
			case "abort": {
				if(this.__getType(this.onAbort) === "function") {
					this.onAbort.call(this, argParams);
				}
				break;
			}
			case "pause": {
				if(this.__getType(this.onPause) === "function") {
					this.onPause.call(this, argParams);
				}
				break;
			}
			case "resume": {
				if(this.__getType(this.onResume) === "function") {
					this.onResume.call(this, argParams);
				}
				break;
			}
		}
	}
	async __processList(argData) {
		for(const element of argData) {
			const count = Object.hasOwn(element, "count") ? element.count : 1;
			this.__dispatchEvent("start", element);
			for(let i = 1; i <= count; i++) {
				if(Object.hasOwn(element, "children")) {
					await this.__processList(element.children);
				} else {
					await this.__processInterval(element);
				}
			}
			this.__dispatchEvent("end", element);
		}
	}
	__bindEaseFunction() {
		if(Reflect.has(this.__timeline, "channels")) {
			for(const timeline of Object.values(this.__timeline.channels)) {
				if(!Reflect.has(timeline, "__func")) {
					timeline.__func = this.__easeFunc(timeline.easeFunction);
				}
			}
		} else {
			if(!Reflect.has(this.__timeline, "__func")) {
				this.__timeline.__func = this.__easeFunc(this.__timeline.easeFunction);
			}
		}
	}
	async __processInterval(argTimeline) {
		return new Promise((ok, abort) => {
			this.__timeline = argTimeline;
			this.__startTime = performance.now();
			this.__passedTime = 0;
			this.__bindEaseFunction();
			let timeoutId;
			const timeoutFunc = () => {
				this.__value = 1;
				this.__calculateActualValue();
				this.__dispatchEvent("endIteration", argTimeline);
				this.__disableControllers();
				ok();
			}
			const abortFunc = () => {
				clearTimeout(timeoutId);
				if(this.__status === "run") {
					this.__calculate();
				}
				this.__status = "stop";
				this.__dispatchEvent("abort", argTimeline);
				this.__disableControllers();
				abort();
			};
			const pauseFunc = () => {
				clearTimeout(timeoutId);
				this.__calculate();
				this.__passedTime = Math.min(this.__timeline.duration, this.__passedTime + (performance.now() - this.__startTime));
				this.__status = "pause";
				this.__dispatchEvent("pause", argTimeline);
			};
			const resumeFunc = () => {
				this.__status = "run";
				this.__startTime = performance.now();
				this.__dispatchEvent("resume", argTimeline);
				timeoutId = setTimeout(timeoutFunc, Math.max(0, this.__timeline.duration - this.__passedTime));
			};
			this.__controller = (aMode) => {
				switch(aMode) {
					case "abort":
						abortFunc();
						break;
					case "pause":
						pauseFunc();
						break;
					case "resume":
						resumeFunc();
						break;
					case "break":
						clearTimeout(timeoutId);
						timeoutFunc();
						break;
				}
			}
			this.__value = 0;
			this.__calculateActualValue();
			this.__dispatchEvent("startIteration", argTimeline);
			timeoutId = setTimeout(timeoutFunc, this.__timeline.duration);
		});
	}
	calculate() {
		if(this.__timeline && this.__status === "run") {
			this.__calculate();
		}
	}
	__calculate() {
		this.__value = (performance.now() - this.__startTime + this.__passedTime) / this.__timeline.duration;
		this.__calculateActualValue();
	}
	__calculateActualValue() {
		if(Reflect.has(this.__timeline, "channels")) {
			this.__actualValue = {};
			for(const [name, timeline] of Object.entries(this.__timeline.channels)) {
				const value = timeline.__func(this.__value);
				this.__actualValue[name] = timeline.startValue + (timeline.endValue - timeline.startValue) * value;
			}
		} else {
			const value = this.__timeline.__func(this.__value);
			this.__actualValue = this.__timeline.startValue + (this.__timeline.endValue - this.__timeline.startValue) * value;
		}
	}
	get value() {
		return this.__actualValue;
	}
	get status() {
		return this.__status;
	}
    __easeFunc(argType, x) {
        switch(argType.toLowerCase()) {
            case "linear": {return function(x) {return x;}}
            case "easeinsine": {return function(x) {return 1 - Math.cos((x * Math.PI) / 2);}}
            case "easeoutsine": {return function(x) {return Math.sin((x * Math.PI) / 2);}}
            case "easeinoutsine": {return function(x) {return -(Math.cos(Math.PI * x) - 1) / 2;}}
            case "easeincubic": {return function(x) {return x * x * x;}}
            case "easeoutcubic": {return function(x) {return 1 - Math.pow(1 - x, 3);}}
            case "easeinoutcubic": {return function(x) {return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;}}
            case "easeinquint": {return function(x) {return x * x * x * x * x;}}
            case "easeoutquint": {return function(x) {return 1 - Math.pow(1 - x, 5);}}
            case "easeinoutquint": {return function(x) {return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;}}
            case "easeincirc": {return function(x) {return 1 - Math.sqrt(1 - Math.pow(x, 2));}}
            case "easeoutcirc": {return function(x) {return Math.sqrt(1 - Math.pow(x - 1, 2));}}
            case "easeinoutcirc": {return function(x) {return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;}}
            case "easeinelastic": {return function(x) {const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);}}
            case "easeoutelastic": {return function(x) {const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;}}
            case "easeinoutelastic": {return function(x) {const c5 = (2 * Math.PI) / 4.5; return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;}}
            case "easeinquad": {return function(x) {return x * x;}}
            case "easeoutquad": {return function(x) {return 1 - (1 - x) * (1 - x);}}
            case "easeinoutquad": {return function(x) {return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;}}
            case "easeinquart": {return function(x) {return x * x * x * x;}}
            case "easeoutquart": {return function(x) {return 1 - Math.pow(1 - x, 4);}}
            case "easeinoutquart": {return function(x) {return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;}}
            case "easeinexpo": {return function(x) {return x === 0 ? 0 : Math.pow(2, 10 * x - 10);}}
            case "easeoutexpo": {return function(x) {return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);}}
            case "easeinoutexpo": {return function(x) {return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;}}
            case "easeinback": {return function(x) {const c1 = 1.70158; const c3 = c1 + 1; return c3 * x * x * x - c1 * x * x;}}
            case "easeoutback": {return function(x) {const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);}}
            case "easeinoutback": {return function(x) {const c1 = 1.70158; const c2 = c1 * 1.525; return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;}}
            case "easeinbounce": {return function(x) {
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }
                }
                return 1 - easeOutBounce(1 - x);
            }}
            case "easeoutbounce": {return function(x) {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (x < 1 / d1) {
                    return n1 * x * x;
                } else if (x < 2 / d1) {
                    return n1 * (x -= 1.5 / d1) * x + 0.75;
                } else if (x < 2.5 / d1) {
                    return n1 * (x -= 2.25 / d1) * x + 0.9375;
                } else {
                    return n1 * (x -= 2.625 / d1) * x + 0.984375;
                }
            }}
            case "easeinoutbounce": {return function(x) {
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }
                }
                return x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2;
            }}
            default: {return function(x) {return x;}}
        }
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
}

export {SilverRainEaseNode};
