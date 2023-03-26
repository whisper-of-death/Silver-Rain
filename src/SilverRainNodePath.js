// ----------------------------------------------
//        Distributed under the MIT license
//          Copyright 2023 Leonid Petrunya
//               All rights reserved
// ----------------------------------------------
//              SilverRainNodePath
// ----------------------------------------------

const Nodes = new Map([
	// Core
	["framebuffer", {
		class: "SilverRainFramebufferNode",
		file: "./SilverRainFramebufferNode.js"
	}],
	["rectangle", {
		class: "SilverRainRectangleNode",
		file: "./SilverRainRectangleNode.js"
	}],
	["generate", {
		class: "SilverRainGenerateNode",
		file: "./SilverRainGenerateNode.js"
	}],
	["3dcube", {
		class: "SilverRain3dCubeNode",
		file: "./SilverRain3dCubeNode.js"
	}],
	["atlas", {
		class: "SilverRainAtlasNode",
		file: "./SilverRainAtlasNode.js"
	}],
	["canvas", {
		class: "SilverRainCanvasNode",
		file: "./SilverRainCanvasNode.js"
	}],
	["draw3d", {
		class: "SilverRainDraw3dNode",
		file: "./SilverRainDraw3dNode.js"
	}],
	["drawsprite", {
		class: "SilverRainDrawSpriteNode",
		file: "./SilverRainDrawSpriteNode.js"
	}],
	["drawtext", {
		class: "SilverRainDrawTextNode",
		file: "./SilverRainDrawTextNode.js"
	}],
	["drawtexturecubemap", {
		class: "SilverRainDrawTextureCubemapNode",
		file: "./SilverRainDrawTextureCubemapNode.js"
	}],
	["drawtexture", {
		class: "SilverRainDrawTextureNode",
		file: "./SilverRainDrawTextureNode.js"
	}],
	["ease", {
		class: "SilverRainEaseNode",
		file: "./SilverRainEaseNode.js"
	}],
	["event", {
		class: "SilverRainEventNode",
		file: "./SilverRainEventNode.js"
	}],
	["function", {
		class: "SilverRainFunctionNode",
		file: "./SilverRainFunctionNode.js"
	}],
	["graph", {
		class: "SilverRainGraphNode",
		file: "./SilverRainGraphNode.js"
	}],
	["image", {
		class: "SilverRainImageNode",
		file: "./SilverRainImageNode.js"
	}],
	["sdffont", {
		class: "SilverRainSdfFontNode",
		file: "./SilverRainSdfFontNode.js"
	}],
	["text", {
		class: "SilverRainTextNode",
		file: "./SilverRainTextNode.js"
	}],
	["texturecubemap", {
		class: "SilverRainTextureCubemapNode",
		file: "./SilverRainTextureCubemapNode.js"
	}],
	["texture", {
		class: "SilverRainTextureNode",
		file: "./SilverRainTextureNode.js"
	}],
	["transformforest", {
		class: "SilverRainTransformForestNode",
		file: "./SilverRainTransformForestNode.js"
	}],
	["video", {
		class: "SilverRainVideoNode",
		file: "./SilverRainVideoNode.js"
	}],
	["textobject", {
		class: "SilverRainTextObjectNode",
		file: "./SilverRainTextObjectNode.js"
	}],
	["drawtextobject", {
		class: "SilverRainDrawTextObjectNode",
		file: "./SilverRainDrawTextObjectNode.js"
	}],
	["texteffect", {
		class: "SilverRainTextEffectNode",
		file: "./SilverRainTextEffectNode.js"
	}],
	["region", {
		class: "SilverRainRegionNode",
		file: "./SilverRainRegionNode.js"
	}],
	["skybox", {
		class: "SilverRainSkyBoxNode",
		file: "./SilverRainSkyBoxNode.js"
	}],
	["camera", {
		class: "SilverRainCameraNode",
		file: "./SilverRainCameraNode.js"
	}],
	// Effects
	["effects/luminance", {
		class: "SilverRainLuminanceNode",
		file: "./Effects/SilverRainLuminanceNode.js"
	}],
	["effects/bokeh", {
		class: "SilverRainBokehNode",
		file: "./Effects/SilverRainBokehNode.js"
	}],
	["effects/pixelation", {
		class: "SilverRainPixelationNode",
		file: "./Effects/SilverRainPixelationNode.js"
	}],
	["effects/sobel", {
		class: "SilverRainSobelNode",
		file: "./Effects/SilverRainSobelNode.js"
	}],
	["effects/toon", {
		class: "SilverRainToonNode",
		file: "./Effects/SilverRainToonNode.js"
	}],
	["effects/adjustment", {
		class: "SilverRainAdjustmentNode",
		file: "./Effects/SilverRainAdjustmentNode.js"
	}],
	["effects/noise", {
		class: "SilverRainNoiseNode",
		file: "./Effects/SilverRainNoiseNode.js"
	}],
	["effects/sepia", {
		class: "SilverRainSepiaNode",
		file: "./Effects/SilverRainSepiaNode.js"
	}],
	["effects/droste", {
		class: "SilverRainDrosteNode",
		file: "./Effects/SilverRainDrosteNode.js"
	}],
	// Transitions
	["transitions/mix", {
		class: "SilverRainMixNode",
		file: "./Transitions/SilverRainMixNode.js"
	}],
	["transitions/displacement", {
		class: "SilverRainDisplacementNode",
		file: "./Transitions/SilverRainDisplacementNode.js"
	}],
	["transitions/dissolve", {
		class: "SilverRainDissolveNode",
		file: "./Transitions/SilverRainDissolveNode.js"
	}],
	["transitions/windowslice", {
		class: "SilverRainWindowsliceNode",
		file: "./Transitions/SilverRainWindowsliceNode.js"
	}],
	["transitions/dots", {
		class: "SilverRainDotsNode",
		file: "./Transitions/SilverRainDotsNode.js"
	}],
	["transitions/pinwheel", {
		class: "SilverRainPinwheelNode",
		file: "./Transitions/SilverRainPinwheelNode.js"
	}],
	["transitions/simplezoom", {
		class: "SilverRainSimpleZoomNode",
		file: "./Transitions/SilverRainSimpleZoomNode.js"
	}],
	["transitions/radial", {
		class: "SilverRainRadialNode",
		file: "./Transitions/SilverRainRadialNode.js"
	}],
	["transitions/flyeye", {
		class: "SilverRainFlyEyeNode",
		file: "./Transitions/SilverRainFlyEyeNode.js"
	}],
	["transitions/fadegrayscale", {
		class: "SilverRainFadeGrayscaleNode",
		file: "./Transitions/SilverRainFadeGrayscaleNode.js"
	}],
	["transitions/swirl", {
		class: "SilverRainSwirlNode",
		file: "./Transitions/SilverRainSwirlNode.js"
	}],
	["transitions/circlecrop", {
		class: "SilverRainCircleCropNode",
		file: "./Transitions/SilverRainCircleCropNode.js"
	}],
	["transitions/colordistance", {
		class: "SilverRainColorDistanceNode",
		file: "./Transitions/SilverRainColorDistanceNode.js"
	}],
	["transitions/wiperight", {
		class: "SilverRainWipeRightNode",
		file: "./Transitions/SilverRainWipeRightNode.js"
	}],
	["transitions/wipeleft", {
		class: "SilverRainWipeLeftNode",
		file: "./Transitions/SilverRainWipeLeftNode.js"
	}],
	["transitions/wipedown", {
		class: "SilverRainWipeDownNode",
		file: "./Transitions/SilverRainWipeDownNode.js"
	}],
	["transitions/wipeup", {
		class: "SilverRainWipeUpNode",
		file: "./Transitions/SilverRainWipeUpNode.js"
	}],
	["transitions/directionalwarp", {
		class: "SilverRainDirectionalWarpNode",
		file: "./Transitions/SilverRainDirectionalWarpNode.js"
	}],
	["transitions/directional", {
		class: "SilverRainDirectionalNode",
		file: "./Transitions/SilverRainDirectionalNode.js"
	}],
	["transitions/displacementmap", {
		class: "SilverRainDisplacementMapNode",
		file: "./Transitions/SilverRainDisplacementMapNode.js"
	}],
	["transitions/bowtievertical", {
		class: "SilverRainBowTieVerticalNode",
		file: "./Transitions/SilverRainBowTieVerticalNode.js"
	}],
	["transitions/bowtiehorizontal", {
		class: "SilverRainBowTieHorizontalNode",
		file: "./Transitions/SilverRainBowTieHorizontalNode.js"
	}],
	["transitions/linearblur", {
		class: "SilverRainLinearBlurNode",
		file: "./Transitions/SilverRainLinearBlurNode.js"
	}],
	["transitions/glitchmemories", {
		class: "SilverRainGlitchMemoriesNode",
		file: "./Transitions/SilverRainGlitchMemoriesNode.js"
	}],
	["transitions/perlin", {
		class: "SilverRainPerlinNode",
		file: "./Transitions/SilverRainPerlinNode.js"
	}],
	["transitions/bounce", {
		class: "SilverRainBounceNode",
		file: "./Transitions/SilverRainBounceNode.js"
	}],
	["transitions/dreamy", {
		class: "SilverRainDreamyNode",
		file: "./Transitions/SilverRainDreamyNode.js"
	}],
	["transitions/gridflip", {
		class: "SilverRainGridFlipNode",
		file: "./Transitions/SilverRainGridFlipNode.js"
	}],
	["transitions/burnout", {
		class: "SilverRainBurnOutNode",
		file: "./Transitions/SilverRainBurnOutNode.js"
	}],
	["transitions/crosshatch", {
		class: "SilverRainCrossHatchNode",
		file: "./Transitions/SilverRainCrossHatchNode.js"
	}],
	["transitions/leaf", {
		class: "SilverRainLeafNode",
		file: "./Transitions/SilverRainLeafNode.js"
	}],
	["transitions/windowblinds", {
		class: "SilverRainWindowBlindsNode",
		file: "./Transitions/SilverRainWindowBlindsNode.js"
	}],
	["transitions/hexagon", {
		class: "SilverRainHexagonNode",
		file: "./Transitions/SilverRainHexagonNode.js"
	}],
	["transitions/ripple", {
		class: "SilverRainRippleNode",
		file: "./Transitions/SilverRainRippleNode.js"
	}],
	["transitions/circleopen", {
		class: "SilverRainCircleOpenNode",
		file: "./Transitions/SilverRainCircleOpenNode.js"
	}],
	// Geometries
	["geometries/circle", {
		class: "SilverRainCircleNode",
		file: "./Geometries/SilverRainCircleNode.js"
	}],
])

export {Nodes};
