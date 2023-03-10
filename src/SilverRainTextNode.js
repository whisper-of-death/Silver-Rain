// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainTextNode
// ----------------------------------------------

import {SilverRainBaseTextureNode} from './SilverRainBaseTextureNode.js';

class SilverRainTextNode extends SilverRainBaseTextureNode {
	// Input
	paddingTop = 0;
	paddingBottom = 0;
	paddingLeft = 0;
	paddingRight = 0;
	fontFamily = "sans-serif";
	fontSize = 10;
	fontWeight = "normal";
	fontStyle =  "normal";
	textBaseline = "alphabetic";
	textAlign = "left";
	text = "";
	fineText = false;
	desiredWidth = 500;
	shrink = true;
	grow = true;
	alpha = 1;
	color = "#000000";
	backgroundColor = undefined;
	shadowColor = "#888888";
	shadowOffsetX = 0;
	shadowOffsetY = 0;
	shadowBlur = 0;
	lineHeight = 1.1;
	instantDraw = false;
	// Global
	width = 0;
	height = 0;
	// Local
	__canvas = undefined;
	__context = undefined;
	__lineHeight = undefined;
	__font = undefined;
	__textLines = undefined;

	constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
		this.__loadArguments(argObject, [
            "paddingTop",
            "paddingBottom",
            "paddingLeft",
            "paddingRight",
            "fontFamily",
            "fontSize",
            "fontWeight",
            "fontStyle",
            "textBaseline",
            "textAlign",
            "text",
            "fineText",
            "desiredWidth",
            "shrink",
            "grow",
            "alpha",
            "color",
            "backgroundColor",
            "shadowColor",
            "shadowOffsetX",
            "shadowOffsetY",
            "shadowBlur",
            "lineHeight",
            "instantDraw",
		]);
        this.__init();
        if(this.__getValue(this.enable) && this.__getValue(this.instantDraw)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
	}
    __init() {
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.__canvas = document.createElement("canvas");
        this.__context = this.__canvas.getContext("2d");
    }
    __parseText() {
		const desiredWidth = this.__getValue(this.desiredWidth);
		const paddingLeft = this.__getValue(this.paddingLeft);
		const paddingRight = this.__getValue(this.paddingRight);
		const paddingTop = this.__getValue(this.paddingTop);
		const paddingBottom = this.__getValue(this.paddingBottom);
		const lineHeight = this.__getValue(this.lineHeight);
		const fontStyle = this.__getValue(this.fontStyle);
		const fontSize = this.__getValue(this.fontSize);
		const fontWeight = this.__getValue(this.fontWeight);
		const fontFamily = this.__getValue(this.fontFamily);
		const grow = this.__getValue(this.grow);
		const shrink = this.__getValue(this.shrink);

        const widthWithoutPadding = desiredWidth - (paddingLeft + paddingRight);
        this.__lineHeight = lineHeight * fontSize;
        this.__font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        this.__textLines = [];
        this.__context.font = this.__font;
        let actualWidth = 0;
        const widthLineInPixel = (argLine) => {
            return this.__context.measureText(argLine).width;
        }
        const pushLine = (argLine) => {
            const lineWidth = widthLineInPixel(argLine);
            this.__textLines.push({
                line: argLine,
                width: lineWidth
            });
            actualWidth = Math.max(actualWidth, lineWidth + paddingLeft + paddingRight);
        }
        const re=/\r\n|\n\r|\n|\r/g;
        let text;
        if(this.fineText) {
            text = this.text.replace(/\n\s*\n/g, '\n\n');
        } else {
            text = this.text;
        }
        const lines=text.replace(re,"\n").split("\n");
        for(const line of lines) {
            const words = line.split(/\s+/).filter(e => e.length > 0);
            let lineWords = "", oldLineWords = "";
            for(const word of words) {
                oldLineWords = lineWords;
                lineWords = lineWords + (lineWords.length > 0 ? " " : "") + word;
                const width = widthLineInPixel(lineWords);
                if(width > widthWithoutPadding && oldLineWords.length > 0) {
                    pushLine(oldLineWords);
                    lineWords = word;
                }
            }
            pushLine(lineWords);
        }
        if((actualWidth > desiredWidth && grow) || (actualWidth < desiredWidth && shrink)) {
            this.width = Math.max(actualWidth, 1);
        } else {
            this.width = desiredWidth;
        }
        this.height = this.paddingTop + this.__lineHeight * this.__textLines.length + this.paddingBottom;
    }
    __drawText() {
		const alpha = this.__getValue(this.alpha);
		const backgroundColor = this.__getValue(this.backgroundColor);
		const paddingLeft = this.__getValue(this.paddingLeft);
		const paddingRight = this.__getValue(this.paddingRight);
		const paddingTop = this.__getValue(this.paddingTop);
		const color = this.__getValue(this.color);
		const textBaseline = this.__getValue(this.textBaseline);
		const textAlign = this.__getValue(this.textAlign);
		const shadowColor = this.__getValue(this.shadowColor);
		const shadowOffsetX = this.__getValue(this.shadowOffsetX);
		const shadowOffsetY = this.__getValue(this.shadowOffsetY);
		const shadowBlur = this.__getValue(this.shadowBlur);

        this.__canvas.width = this.width;
        this.__canvas.height = this.height;
        this.__context.globalAlpha = alpha;
        this.__context.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
		if(backgroundColor !== undefined) {
			this.__context.fillStyle = backgroundColor;
			this.__context.fillRect(0, 0, this.__canvas.width, this.__canvas.height);
		}
        let position;
        switch(this.textAlign) {
            case "left":
            case "start":
                position = paddingLeft;
                break;
            case "right":
            case "end":
                position = this.width - paddingRight;
                break;
            case "center":
                position = paddingLeft + (this.width - (paddingLeft + paddingRight)) / 2;
                break;
            default:
                position = paddingLeft;
                break;
        }
        this.__context.fillStyle = color;
        this.__context.textBaseline = textBaseline;
        this.__context.textAlign = textAlign;
        this.__context.font = this.__font;
        this.__context.shadowColor = shadowColor;
        this.__context.shadowOffsetX = shadowOffsetX;
        this.__context.shadowOffsetY = shadowOffsetY;
        this.__context.shadowBlur = shadowBlur;
        let i = 1;
        const widthWithoutPadding = this.width - (paddingLeft + paddingRight);
        for(const entry of this.__textLines) {
            this.__context.fillText(entry.line, position, paddingTop + this.__lineHeight * i++, Math.max(entry.width, widthWithoutPadding));
        }
    }
    __update() {
        if(this.__getValue(this.enable) && this.__getValue(this.update)) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    draw() {
        this.__parseText();
        this.__checkPowerOfTwo();
        this.__drawText();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.__canvas);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return this;
    }
}

export {SilverRainTextNode};
