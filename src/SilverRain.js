// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//                  SilverRain
// ----------------------------------------------

import {SilverRainBase} from "./SilverRainBase.js";
import {Nodes} from "./SilverRainNodePath.js";

class SilverRain extends SilverRainBase {
	// Input
	webglVersion = undefined;
	canvas = undefined;
	preserveDrawingBuffer = false;
	precision = "medium";
	resize = false;
	// Global
	gl = undefined;
	rootNode = undefined;
	// Local
	__definedNodes = undefined;
	__importedNodes = new Map();
	#id = 1;
	constructor(argObject) {
		super();
		this.__loadArguments(argObject,[
			"webglVersion",
			"canvas",
			"preserveDrawingBuffer",
			"precision",
			"resize"
		]);
		this.__definedNodes = Nodes;
		this.__init();
	}
	__init() {
        if(!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.documentElement.appendChild(this.canvas);
        }
        const options = {
            depth: true,
            stencil: true,
            alpha: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: this.preserveDrawingBuffer,
            powerPreference: "high-performance"
        };
        switch(this.webglVersion) {
            case 1:
            {
                this.gl = this.canvas.getContext("webgl", options);
                break;
            }
            case 2:
            {
                this.gl = this.canvas.getContext("webgl2", options);
                break;
            }
            default:
            {
                this.gl = this.canvas.getContext("webgl2", options);
                if(!this.gl) {
                    this.gl = this.canvas.getContext("webgl", options);
                }
                break;
            }
        }
        if(!this.gl) {
            this.__error("WebGL initialization error");
        }
        this.webglVersion = this.gl instanceof WebGLRenderingContext ? 1 : 2;
        switch(this.precision.toLowerCase()) {
            case "low":
            {
                this.precision = "lowp";
                break;
            }
            case "high":
            {
                this.precision = "highp";
                break;
            }
            default:
            {
                this.precision = "mediump";
                break;
            }
        }
        if(this.resize) {
            window.addEventListener("resize", () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }, false);
        }
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.STENCIL_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.disable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clearDepth(1);
        this.gl.clearStencil(0);
	}
    update() {
        this.rootNode?.__update();
    }
    clear(...argModes) {
        let param = 0;
        for(const mode of argModes) {
            switch(mode.toLowerCase()) {
                case "color":
                    param = param | this.gl.COLOR_BUFFER_BIT;
                    break;
                case "depth":
                    param = param | this.gl.DEPTH_BUFFER_BIT;
                    break;
                case "stencil":
                    param = param | this.gl.STENCIL_BUFFER_BIT;
                    break;
            }
        }
        if(param != 0) {
            this.gl.clear(param);
        }
        return this;
    }
	clearColor(argColor) {
        this.gl.clearColor(argColor[0], argColor[1], argColor[2], argColor[3]);
        return this;
    }
    clearDepth(argDepth) {
        this.gl.clearDepth(argDepth);
        return this;
    }
    clearStencil(argStencil) {
        this.gl.clearStencil(argStencil);
        return this;
    }
	cullFace(...argModes) {
        for(const mode of argModes) {
			switch(mode.toLowerCase()) {
				case "enable":
					this.gl.enable(this.gl.CULL_FACE);
					break;
				case "disable":
					this.gl.disable(this.gl.CULL_FACE);
					break;
				case "front":
					this.gl.cullFace(this.gl.FRONT);
					break;
				case "back":
					this.gl.cullFace(this.gl.BACK);
					break;
				case "frontandback":
					this.gl.cullFace(this.gl.FRONT_AND_BACK);
					break;
			}
		}
        return this;
	}
    __uniqueId() {
        return this.#id++;
    }
    program(argVShaderSrc, argFShaderSrc) {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(vertexShader, argVShaderSrc);
        this.gl.shaderSource(fragmentShader, argFShaderSrc);
        this.gl.compileShader(vertexShader);
        if(!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
            this.__error("Vertex shader error: " + this.gl.getShaderInfoLog(vertexShader));
        }
        this.gl.compileShader(fragmentShader);
        if(!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            this.__error("Fragment shader error: " + this.gl.getShaderInfoLog(fragmentShader));
        }
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.__error("Program linking error: " + this.gl.getProgramInfoLog(program));
        }
        return program;
    }
    async importNodes(...aNodes) {
		const files = [];
		for(let node of aNodes) {
			node = node.toLowerCase();
			if(!this.__definedNodes.has(node)) {
				this.__error(`Node '${node}' has not been defined`);
			}
			const dNode = this.__definedNodes.get(node);
			if(!this.__importedNodes.has(dNode.class)) {
				files.push(dNode.file);
			}
		}
		const promises = files.map(file => {
			return import(file)
				.then(element => {
                    for(const [key, value] of Object.entries(element)) {
                        this.__importedNodes.set(key, value);
                    }
                })
                .catch(error => {
                    let dopMessage = ``;
                    if(error.hasOwnProperty("lineNumber") && error.hasOwnProperty("columnNumber")) {
                        dopMessage = ` in line ${error.lineNumber}, column ${error.columnNumber}`;
                    }
                    this.__error(`Error in file '${file}' ${error}${dopMessage}`);
                });
		});
        return Promise.all(promises);
	}
	node(aName, aParams) {
		const name = aName.toLowerCase();
		if(!this.__definedNodes.has(name)) {
			this.__error(`Node '${aName}' has not been defined`);
		}
		const className = this.__definedNodes.get(name).class;
        if(!this.__importedNodes.has(className)) {
            this.__error(`Node '${aName}' has not been imported`);
        }
        const node = this.__importedNodes.get(className);
        const instance = new node(aParams, {
            id: this.__uniqueId(),
            root: this,
            gl: this.gl,
        });
        return instance;
	}
	defineNodes(...aNodes) {
		for(const node of aNodes) {
			this.__definedNodes.set(node.name, {
				class: node.class,
				file: node.file
			});
		}
		return this;
	}
	undefineNodes(...aNames) {
		for(const name of aNames) {
			this.__definedNodes.delete(name);
		}
		return this;
	}
	isdefineNodes(...aNames) {
		for(const name of aNames) {
			if(!this.__definedNodes.has(name)) {
				return false;
			}
		}
		return true;
	}
}

export {SilverRain}
