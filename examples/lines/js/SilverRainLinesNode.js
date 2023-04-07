// ----------------------------------------------
//         Copyright 2023 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              SilverRainLinesNode
// ----------------------------------------------

import {SilverRainBaseNode} from './../../../src/SilverRainBaseNode.js';
import {Mat4} from "./../../../src/SilverRainMath.js";

class SilverRainLinesNode extends SilverRainBaseNode {
	// Input
	width = 9;
	height = 9;
	margin = 20;
	atlasImageSrc = undefined;
	atlasJsonSrc = undefined;
	// Global
	// Local
	__ballWidth = undefined;
	__ballHeight = undefined;
	__cellWidth = undefined;
	__cellHeight = undefined;
	__cells = [];
	__balls = new Map();
	__ballId = 1;
	__bgSprites = [];
	__fgSprites = [];
	__selectedCell = undefined;
	__newBalls = [];
	__colors = [
		"ball-aqua",
		"ball-blue",
		"ball-green",
		"ball-pink",
		"ball-red",
		"ball-violet",
		"ball-yellow",
	];
	__gameOver = false;
	__path = [];
	__pathPtr = undefined;
	__easeNodeNewBall = undefined;
	__easeNodeMoveBall = undefined;
	__globalScale = 1;
	__graphNode = undefined;
	__eventNode = undefined;
	__easeNodePulse = undefined;
	__easeNodeNewBall = undefined;
	__easeNodeMoveBall = undefined;
	__lookatMatrix = undefined;
	__projectionMatrix = undefined;
	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
			"width",
			"height",
			"margin",
			"atlasImageSrc",
			"atlasJsonSrc"
		]);
    }
    async init() {
		const nodes = [
			"graph",
			"atlas",
			"function",
			"drawSprite",
			"event",
			"ease"
		];
		await this.root.importNodes(...nodes);
		this.__graphNode = this.root.node("graph", {
			name: "Graph Node",
			clear: false,
		});
		this.__eventNode = this.__graphNode.node("event", {
			name: "Event Node",
		});
		this.__easeNodePulse = this.__graphNode.node("ease", {
			name: "Ease Node Pulse",
			data: [
				{
					count: Infinity,
					children: [
						{
							duration: 250,
							count:1,
							startValue: 1,
							endValue: 0.5,
							easeFunction: "easeinoutquad",
						},
						{
							duration: 250,
							count:1,
							startValue: 0.5,
							endValue: 1,
							easeFunction: "easeinoutquad",
						},
					],
				}
			],
		});
		this.__easeNodeNewBall = this.__graphNode.node("ease", {
			name: "Ease New Ball",
			data: [
				{
					count: 1,
					duration: 500,
					startValue: 0,
					endValue: 1,
					easeFunction: "easeinoutquad",
				},
				{
					count: 1,
					duration: 200,
					startValue: 1,
					endValue: 1,
					easeFunction: "linear",
					onEndIteration: () => {
						this.__checkLines();
						this.__checkWin();
						this.__newBalls = [];
					},
				}
			],
		});
		this.__easeNodeMoveBall = this.__graphNode.node("ease", {
			name: "Ease Move Ball",
			data: [
				{
					count: () => this.__path.length - 1,
					children: [
						{
							duration: 10,
							startValue: 0,
							endValue: 1,
							easeFunction: "linear",
						},
						{
							duration: 10,
							startValue: 1,
							endValue: 1,
							easeFunction: "linear",
						},
					],
					onEndIteration: () => {this.__pathPlus();},
				},
				{
					count: 1,
					duration: 200,
					startValue: 1,
					endValue: 1,
					easeFunction: "linear",
					onEnd: () => {
						const result = this.__checkLines();
						this.__checkWin();
						if(!result && !this.__gameOver) {
							this.__newMove();
						}
					}
				}
			],
		});
		this.__atlasNode = this.__graphNode.node("atlas", {
			name: "Atlas Node",
			imageSrc: this.__getValue(this.atlasImageSrc),
			jsonSrc: this.__getValue(this.atlasJsonSrc),
			request: {mode: 'cors'},
		});
		await this.__atlasNode.load().catch(e => console.error(e));
		const ballInfo = this.__atlasNode.spriteInfo(this.__colors[0]);
		const cellInfo = this.__atlasNode.spriteInfo("cell-bgr");
		this.__ballWidth = ballInfo.width;
		this.__ballHeight = ballInfo.height;
		this.__cellWidth = cellInfo.width + 1;
		this.__cellHeight = cellInfo.height + 1;
		this.__lookatMatrix = Mat4.lookatLeft({
			object: [0,0,0],
			camera: [0,0,-100],
			up: [0,1,0]
		});
		this.__funcNode = this.__graphNode.node("function", {
			name: "Func Node",
			code: () => {
				const w = this.gl.drawingBufferWidth / 2;
				const h = this.gl.drawingBufferHeight / 2;
				this.__projectionMatrix = Mat4.orthoLeft({
					left: -w,
					right: w,
					bottom: -h,
					top: h,
					near: 1,
					far: 3000
				});
				this.__calculateGlobalScale();
				this.__createFgSprites();
				this.__createBgSprites();
			},
			instantCall: true,
		});
		this.__drawBgSpriteNode = this.__graphNode.node("drawSprite", {
			name: "Draw Background Sprites",
			sprites: () => this.__bgSprites,
			lookatMatrix: () => this.__lookatMatrix,
			projectionMatrix: () => this.__projectionMatrix,
			atlasNode: this.__atlasNode,
			instantDraw: true,
			eventNode: this.__eventNode
		}).addParentNodes(this.__funcNode);
		this.__drawFgSpriteNode = this.__graphNode.node("drawSprite", {
			name: "Draw Foreground Sprites",
			sprites: () => this.__fgSprites,
			lookatMatrix: () => this.__lookatMatrix,
			projectionMatrix: () => this.__projectionMatrix,
			atlasNode: this.__atlasNode,
			instantDraw: true,
		}).addParentNodes(this.__drawBgSpriteNode);

		this.__graphNode.sort();
		this.__createCells();
		this.__setEvents();
		this.__newMove();
	}
	__createCells() {
		let n = 0;
		for(let row = 1; row <= this.height; row++) {
			for(let column = 1; column <= this.width; column++) {
				const obj = {
					id: n,
					ballId: undefined,
					links: [],
					wave: undefined,
					row: row - 1,
					column: column - 1
				};
				if(row < this.height) {obj.links.push(n + this.width);}
				if(row > 1) {obj.links.push(n - this.width);}
				if(column > 1) {obj.links.push(n - 1);}
				if(column < this.width) {obj.links.push(n + 1);}
				this.__cells.push(obj);
				n++;
			}
		}
	}
	__createNewBall() {
		const id = this.__ballId++;
		const obj = {
			id: id,
			color: this.__getRandomColor()
		};
		this.__balls.set(id, obj);
 		return obj;
	}
	__getFreeCell() {
		const freeCells = this.__cells.filter(e => !e.ballId);
		if(freeCells.length === 0) {
			return undefined;
		}
		return freeCells[Math.floor(Math.random() * freeCells.length)];
	}
	__getFreeCellsCount() {
		return this.__cells.filter(e => !e.ballId).length;
	}
	__getRandomColor() {
		return this.__colors[Math.floor(Math.random() * this.__colors.length)];
	}
	__calculateGlobalScale() {
		const w = this.gl.drawingBufferWidth;
		const h = this.gl.drawingBufferHeight;
		const scaleWidth = Math.min(w / (this.__cellWidth * this.width + this.margin * 2), 1);
		const scaleHeight = Math.min(h / (this.__cellHeight * this.height + this.margin * 2), 1);
		this.__globalScale = Math.min(scaleWidth, scaleHeight);
	}
	__createBgSprites() {
		this.__bgSprites = [];
		const t1 = Mat4.translate(-this.__cellWidth / 2, -this.__cellHeight / 2, 0);
		const s1 = Mat4.scale(this.__globalScale, this.__globalScale, 1);
		const m1 = Mat4.multiply(s1, t1);
		for(const cell of this.__cells) {
			const dx = -this.__cellWidth * this.width / 2 + this.__cellWidth / 2;
			const dy = -this.__cellHeight * this.height / 2 + this.__cellHeight / 2;
			const t2 = Mat4.translate((dx + cell.column * this.__cellWidth) * this.__globalScale, (dy + cell.row * this.__cellHeight) * this.__globalScale, 0);
			let matrix = Mat4.multiply(t2, m1);
			this.__bgSprites.push({
				name: "cell-bgr",
				id: "bg" + cell.id,
				transformMatrix: matrix
			});
		}
	}
	__createFgSprites() {
		this.__fgSprites = [];
		for(const cell of this.__cells) {
			if(!cell.ballId) {
				continue;
			}
			const ball = this.__balls.get(cell.ballId);
			let scale;
			if(this.__selectedCell !== undefined && this.__selectedCell === cell) {
				scale = this.__easeNodePulse.value;
			} else if(this.__newBalls.includes(ball.id)) {
				scale = this.__easeNodeNewBall.value;
			} else {
				scale = 1;
			}
			scale *= this.__globalScale;
			const t1 = Mat4.translate(-this.__ballWidth / 2, -this.__ballHeight / 2, 0);
			const s1 = Mat4.scale(scale, scale, 1);
			const dx = -this.__cellWidth * this.width / 2 + this.__cellWidth / 2;
			const dy = -this.__cellHeight * this.height / 2 + this.__cellHeight / 2;
			const t2 = Mat4.translate((dx + cell.column * this.__cellWidth) * this.__globalScale, (dy + cell.row * this.__cellHeight) * this.__globalScale, -1);
			let matrix = Mat4.multiply(s1, t1);
			matrix = Mat4.multiply(t2, matrix);
			this.__fgSprites.push({
				name: ball.color,
				transformMatrix: matrix
			});
		}
	}
	__checkLines() {
		let lines = [];
		let line;
		for(let row = 0; row < this.height; row++) {
			line = [];
			for(let column = 0; column < this.width; column++) {
				const idx = row * this.width + column;
				const cell = this.__cells[idx];
				if(cell.ballId) {
					const color = this.__balls.get(cell.ballId).color;
					if(line.length === 0) {
						line.push(cell);
					} else {
						if(color === this.__balls.get(line[0].ballId).color) {
							line.push(cell);
						} else {
							if(line.length >= 5) {
								break;
							} else {
								line = [];
								line.push(cell);
							}
						}
					}
				} else {
					if(line.length >= 5) {
						break;
					} else {
						line = [];
					}
				}
			}
			if(line.length >= 5) {
				lines.push(line);
			}
		}
		for(let column = 0; column < this.width; column++) {
			line = [];
			for(let row = 0; row < this.height; row++) {
				const idx = row * this.width + column;
				const cell = this.__cells[idx];
				if(cell.ballId) {
					const color = this.__balls.get(cell.ballId).color;
					if(line.length === 0) {
						line.push(cell);
					} else {
						if(color === this.__balls.get(line[0].ballId).color) {
							line.push(cell);
						} else {
							if(line.length >= 5) {
								break;
							} else {
								line = [];
								line.push(cell);
							}
						}
					}
				} else {
					if(line.length >= 5) {
						break;
					} else {
						line = [];
					}
				}
			}
			if(line.length >= 5) {
				lines.push(line);
			}
		}
		if(lines.length > 0) {
			for(const line of lines) {
				for(const cell of line) {
					if(cell.ballId) {
						this.__balls.delete(cell.ballId);
						cell.ballId = undefined;
					}
				}
			}
			return true;
		} else {
			return false;
		}
	}
	__pathPlus() {
		const ballId = this.__path[this.__pathPtr].ballId;
		this.__path[this.__pathPtr++].ballId = undefined;
		this.__path[this.__pathPtr].ballId = ballId;
	}
	__setEvents() {
		const func = (cell) => {
			if(this.__gameOver) {
				return;
			}
			if(this.__selectedCell) {
				if(this.__selectedCell === cell) {
					this.__selectedCell = undefined;
				} else {
					if(cell.ballId) {
						this.__selectedCell = cell;
					} else {
						this.__path = this.__findPath(this.__selectedCell, cell);
						if(this.__path) {
							this.__pathPtr = 0;
							this.__easeNodeMoveBall.start();
						}
						this.__selectedCell = undefined;
					}
				}
			} else {
				if(cell.ballId) {
					this.__selectedCell = cell;
				}
			}
			if(this.__selectedCell && this.__selectedCell.ballId) {
				this.__easeNodePulse.start();
			}
		};
		for(const cell of this.__cells) {
			this.__eventNode
			.addEventListener({
				id: "bg" + cell.id,
				phase: "down",
				event: "click",
				func: () => func(cell)
			})
			.setCursorStyle({
				id: "bg" + cell.id,
				cursor: "pointer"
			});
		}
	}
	__findPath(aBeginCell, aEndCell) {
		this.__cells.forEach(e => e.wave = undefined);
		aBeginCell.wave = 0;
		const queue = [aBeginCell];
		let found = false;
		while(queue.length > 0 && !found) {
			const cell = queue.pop();
			const number = cell.wave;
			for(const link of cell.links) {
				const cell2 = this.__cells[link];
				if(cell2 === aEndCell) {
					cell2.wave = number + 1;
					found = true;
					break;
				}
				if(cell2.ballId !== undefined) {
					continue;
				}
				if(cell2.wave === undefined) {
					cell2.wave = number + 1;
					queue.unshift(cell2);
				}
			}
		}
		if(!found) {
			return false;
		} else {
			const path = [];
			let cell = aEndCell;
			while(cell.wave >= 0) {
				path.unshift(cell);
				if(cell.wave === 0) {
					break;
				}
				for(const link of cell.links) {
					const cell2 = this.__cells[link];
					if(cell2.wave == cell.wave - 1) {
						cell = cell2;
						break;
					}
				}
			}
			return path;
		}
	}
	__checkWin() {
		if(this.__getFreeCellsCount() === this.width * this.height) {
			this.__gameOver = true;
		}
	}
	__newMove() {
		const part = this.__getFreeCellsCount() / (this.width * this.height);
		let max = 3;
		if(part < 0.5 && part >= 0.1) {
			max = 2;
		} else if(part < 0.1) {
			max = 1
		}
		for(let i = 0; i < max; i++) {
			const cell = this.__getFreeCell();
			if(!cell) {
				this.__gameOver = true;
				break;
			}
			const ball = this.__createNewBall();
			this.__newBalls.push(ball.id);
			cell.ballId = ball.id;
		}
		if(this.__newBalls.length > 0) {
			this.__easeNodeNewBall.start();
		}
		if(this.__getFreeCellsCount() === 0) {
			this.__gameOver = true;
		}
	}
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
			this.__graphNode.__update();
            this.__cleanup();
        }
    }
}

export {SilverRainLinesNode};

