// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainGraphNode
// ----------------------------------------------

import {SilverRainBaseNode} from './SilverRainBaseNode.js';

class SilverRainGraphNode extends SilverRainBaseNode {
	// Input
	clear = false;
	clearColor = undefined;
	// Local
	__graph = new Map();
	__sortedGraph = new Map();
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"clear",
			"clearColor"
		]);
    }
    __update() {
        if(this.__getValue(this.enable)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    sort() {
		this.__graph.forEach(e => {
			e.children.clear();
			e.stage = 0;
		});
        for(const [key, value] of this.__graph) {
            const node = value.node;
            const parentNodes = node.__getParentNodes();
            for(const parentNode of parentNodes) {
                this.__graph.get(parentNode.id)?.children.add(node);
            }
        }
//         this.showGraph();
        this.__sortedGraph.clear();
		const sortedGraph = [];
        const f1 = (e) => {
            switch(e.stage) {
                case 0:
                {
                    e.stage = 1;
                    for(const node of e.children) {
                        f1(this.__graph.get(node.id));
                    }
                    e.stage = 2;
                    sortedGraph.unshift(e.node);
                    break;
                }
                case 1:
                {
                    this.__error("Cycle between nodes.");
                }
                case 2:
                {
                    return;
                }
            }
        }
        for(const [key, value] of this.__graph) {
            f1(value);
        }
        for(const node of sortedGraph) {
            if(SilverRainGraphNode.prototype.isPrototypeOf(node)) {
                node.sort();
            }
            this.__sortedGraph.set(node.id, node);
        }
    }
    showGraph() {
        for(const [key, value] of this.__graph) {
            console.log({id: key, name: value.node.name, children: Array.from(value.children).map(e => e.name).join()});
        }
    }
    showSortedGraph() {
        for(const [key, node] of this.__sortedGraph) {
            console.log({id: node.id, name: node.name, constructor: node.constructor.name, node: node});
        }
    }
    draw() {
		const clearColor = this.__getValue(this.clearColor);
		if(clearColor) {
			this.root.clearColor(clearColor);
		}
        if(this.__getValue(this.clear)) {
            this.root.clear("color", "depth", "stencil");
        }
        for(const [key, node] of this.__sortedGraph) {
            if(node.__update) {
                node.__update();
            }
        }
    }
	node(aName, aParams) {
		const name = aName.toLowerCase();
		if(!this.root.__definedNodes.has(name)) {
			this.__error(`Node '${aName}' has not been defined`);
		}
		const className = this.root.__definedNodes.get(name).class;
        if(!this.root.__importedNodes.has(className)) {
            this.__error(`Node '${aName}' has not been imported`);
        }
        const node = this.root.__importedNodes.get(className);
        const instance = new node(aParams, {
            id: this.root.__uniqueId(),
            root: this.root,
            graph: this,
            gl: this.gl,
        });
        this.__graph.set(instance.id, {
            node: instance,
            children: new Set(),
            stage: 0
        });
        return instance;
	}
	deleteNode(aNode) {
		this.__graph.delete(aNode.id);
		this.__sortedGraph.delete(aNode.id);
		return this;
	}
}

export {SilverRainGraphNode};

