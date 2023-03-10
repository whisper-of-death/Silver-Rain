// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//                SilverRainBase
// ----------------------------------------------

class SilverRainBase {
// 	__event = {};
	__input = new Set();
	constructor() {}
	__error(argMessage) {
		const error = new Error(argMessage);
		console.log("%cError", "font-weight: bold; color: red;");
		console.log(`%c${error.message}`, "color: red;");
		console.log(`%c${error.stack}`, "color: blue;");
		throw 'Program stopped';
	}
    __getType(arg) {
        // number, boolean, string, array, object, function, undefined, window, htmldocument, etc.
        return Object.prototype.toString.call(arg).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    __getValue(argValue) {
        if(this.__getType(argValue) === "function" && !SilverRainBase.prototype.isPrototypeOf(argValue)) {
            return argValue.call(this);
        } else {
            return argValue;
        }
    }
	__loadArguments(argObject = {}, argInputVars = []) {
		for(const key of argInputVars) {
			if(this.hasOwnProperty(key) && argObject.hasOwnProperty(key)) {
				this[key] = argObject[key];
				this.__input.add(key);
			}
		}
	}
	/*
    __loadEvents(argData, ...argFields) {
        argFields.forEach((e) => {
            if(argData.hasOwnProperty(e.name)) {
                this.addEventListener(e.name, argData[e.name]);
            }
        });
    }
    addEventListener(argName, argFunc) {
        if(!Reflect.has(this.__event, argName)) {
            this.__event[argName] = new Set();
        }
		this.__event[argName].add(argFunc);
    }
    removeEventListener(argName, argFunc) {
        if(Reflect.has(this.__event, argName)) {
            return this.__event[argName].delete(argFunc);
        }
        return false;
    }
    trigger(argName, ...args) {
        if(Reflect.has(this.__event, argName)) {
            this.__event[argName].forEach(handler => handler.apply(this, args));
        }
    }
    */
}

export {SilverRainBase}
