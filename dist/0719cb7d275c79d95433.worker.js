/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// image preprocessing functions

function getPixelComponent(imageData, x, y, colorIdx) {
    return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
}
function putPixel(imageData, x, y, r, g, b, a) {
    a = a || 255;
    imageData.data[(y * imageData.width + x) * 4 + 0] = r;
    imageData.data[(y * imageData.width + x) * 4 + 1] = g;
    imageData.data[(y * imageData.width + x) * 4 + 2] = b;
    imageData.data[(y * imageData.width + x) * 4 + 3] = a;
}
function getRect(imageData, x, y, width, height) {
    var data = new Uint8ClampedArray(width * height * 4);
    for (var row = y; row < y + height; row++) {
        var begin = (row * imageData.width + x) * 4;
        var end = begin + width * 4;
        var dataRow = imageData.data.slice(begin, end);
        var offset = (row - y) * width * 4;
        data.set(dataRow, offset);
    }
    return new ImageData(data, width, height);
}
function getRow(imageData, y) {
    var begin = y * imageData.width * 4;
    var end = begin + imageData.width * 4;
    var data = imageData.data.slice(begin, end);
    return new ImageData(data, imageData.width, 1);
}

/*
 * @param imgData: ImageData
 */
function convertToGrayscale(imgData) {
    var w = imgData.width;
    var h = imgData.height;
    var graySum = 0;
    var newImgData = new ImageData(imgData.width, imgData.height);
    var buf = new ArrayBuffer(newImgData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var buf32 = new Uint32Array(buf);

    for (var row = 0; row < h; row++) {
        for (var col = 0; col < w; col++) {
            // gray = 0.299*r + 0.587*g + 0.114*b
            var red = getPixelComponent(imgData, col, row, 0),
                green = getPixelComponent(imgData, col, row, 1),
                blue = getPixelComponent(imgData, col, row, 2);
            var gray = parseInt(0.299 * red + 0.587 * green + 0.114 * blue);
            // putPixel(newImgData, col, row, gray, gray, gray);
            buf32[row * w + col] = 255 << 24 | // alpha
            gray << 16 | // blue
            gray << 8 | // green
            gray; // red
            graySum += gray;
        }
    }
    newImgData.data.set(buf8);

    // return { array: array, threshold: (graySum / (w * h)) };
    return { imgData: newImgData, threshold: graySum / (w * h) };
}

function gradientSimple(imgData, operator) {
    // parameters of operator
    var side = Math.round(Math.sqrt(operator.length));
    var halfSide = Math.floor(side / 2);
    // width/height of the image data
    var w = imgData.width;
    var h = imgData.height;
    // destination array for output and temporary arrays for filling
    var dst = [];
    var newImgData = new ImageData(imgData.width, imgData.height);
    var buf = new ArrayBuffer(newImgData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var buf32 = new Uint32Array(buf);

    var tempLine = [];
    // gradient sum
    var gradSum = 0;

    // parse through all pixels
    for (var y = 0; y < h; y++) {
        tempLine = [];

        for (var x = 0; x < w; x++) {
            // calculate neighbor pixels, escape out of bounds indexes
            var xLeft = Math.max(0, x - 1);
            var xRight = Math.min(w - 1, x + 1);
            var yUp = Math.max(0, y - 1);
            var yDown = Math.min(h - 1, y + 1);

            // simple gradient (equation 19, page 49)
            var vr = getPixelComponent(imgData, xRight, y, 0),
                vl = getPixelComponent(imgData, xLeft, y, 0),
                vd = getPixelComponent(imgData, x, yDown, 0),
                vu = getPixelComponent(imgData, x, yUp, 0);
            var gradX = Math.abs(vr - vl);
            var gradY = Math.abs(vd - vu);
            var gradient = parseInt((gradX + gradY) / 2);
            gradSum = gradSum + gradient;

            // calculate angles
            //let angle = parseInt((Math.atan(gradY / gradX) * 180) / Math.PI);
            var angle = parseInt((gradX == 0 ? 0 : Math.atan(gradY / gradX)) * 180 / Math.PI);
            var q = gradX >= 0 && gradY >= 0 ? 1 : -1;

            // set gradient value for destination pixel
            gradient = Math.abs(gradient);
            // putPixel(newImgData, x, y, gradient, gradient, gradient);
            buf32[y * w + x] = 255 << 24 | // alpha
            gradient << 16 | // blue
            gradient << 8 | // green
            gradient; // red

            tempLine.push([angle, q]);
        }
        dst.push(tempLine);
    }
    newImgData.data.set(buf8);

    return { imgData: newImgData, gradient: dst, threshold: gradSum / (w * h) };
}

/*
 * @param imgData: ImageData
 * @param threshold: number
 */
function binarize(imgData, threshold) {
    var w = imgData.width;
    var h = imgData.height;
    var newImgData = new ImageData(imgData.width, imgData.height);
    var buf = new ArrayBuffer(newImgData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var buf32 = new Uint32Array(buf);

    for (var row = 0; row < h; row++) {
        for (var col = 0; col < w; col++) {
            // gray = 0.299*r + 0.587*g + 0.114*b
            var red = getPixelComponent(imgData, col, row, 0);
            var value = red >= threshold ? 255 : 0;
            // putPixel(newImgData, col, row, value, value, value);
            buf32[row * w + col] = 255 << 24 | // alpha
            value << 16 | // blue
            value << 8 | // green
            value; // red
        }
    }
    newImgData.data.set(buf8);

    return newImgData;
}

function gradientAndBinarize(imgData, gradSobelX) {
    var gradientResult = gradientSimple(imgData, gradSobelX);
    var binImgData = binarize(gradientResult.imgData, gradientResult.threshold);

    // image data was transformed, 
    // return meta gradient info
    return { imgData: binImgData, gradient: gradientResult.gradient };
}

// Just return a value to define the module export.
// This example returns an object, but the module
// can return a function as the exported value.
module.exports = {
    getRect: getRect,
    getRow: getRow,
    convertToGrayscale: convertToGrayscale,
    gradientSimple: gradientSimple,
    binarize: binarize,
    gradientAndBinarize: gradientAndBinarize
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Img = __webpack_require__(0);

var Img = _interopRequireWildcard(_Img);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

onmessage = function onmessage(event) {
  console.log(event.data);
}; /* eslint-disable no-unused-vars */
/* global self:true */
/* global onmessage:true */

postMessage({ type: 'status', payload: { status: 'ready' } });

/***/ })
/******/ ]);
//# sourceMappingURL=0719cb7d275c79d95433.worker.js.map