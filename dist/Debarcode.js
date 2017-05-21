(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Debarcode", [], factory);
	else if(typeof exports === 'object')
		exports["Debarcode"] = factory();
	else
		root["Debarcode"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

module.exports = function() {
	return __webpack_require__(2)("/******/ (function(modules) { // webpackBootstrap\n/******/ \t// The module cache\n/******/ \tvar installedModules = {};\n/******/\n/******/ \t// The require function\n/******/ \tfunction __webpack_require__(moduleId) {\n/******/\n/******/ \t\t// Check if module is in cache\n/******/ \t\tif(installedModules[moduleId]) {\n/******/ \t\t\treturn installedModules[moduleId].exports;\n/******/ \t\t}\n/******/ \t\t// Create a new module (and put it into the cache)\n/******/ \t\tvar module = installedModules[moduleId] = {\n/******/ \t\t\ti: moduleId,\n/******/ \t\t\tl: false,\n/******/ \t\t\texports: {}\n/******/ \t\t};\n/******/\n/******/ \t\t// Execute the module function\n/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n/******/\n/******/ \t\t// Flag the module as loaded\n/******/ \t\tmodule.l = true;\n/******/\n/******/ \t\t// Return the exports of the module\n/******/ \t\treturn module.exports;\n/******/ \t}\n/******/\n/******/\n/******/ \t// expose the modules object (__webpack_modules__)\n/******/ \t__webpack_require__.m = modules;\n/******/\n/******/ \t// expose the module cache\n/******/ \t__webpack_require__.c = installedModules;\n/******/\n/******/ \t// identity function for calling harmony imports with the correct context\n/******/ \t__webpack_require__.i = function(value) { return value; };\n/******/\n/******/ \t// define getter function for harmony exports\n/******/ \t__webpack_require__.d = function(exports, name, getter) {\n/******/ \t\tif(!__webpack_require__.o(exports, name)) {\n/******/ \t\t\tObject.defineProperty(exports, name, {\n/******/ \t\t\t\tconfigurable: false,\n/******/ \t\t\t\tenumerable: true,\n/******/ \t\t\t\tget: getter\n/******/ \t\t\t});\n/******/ \t\t}\n/******/ \t};\n/******/\n/******/ \t// getDefaultExport function for compatibility with non-harmony modules\n/******/ \t__webpack_require__.n = function(module) {\n/******/ \t\tvar getter = module && module.__esModule ?\n/******/ \t\t\tfunction getDefault() { return module['default']; } :\n/******/ \t\t\tfunction getModuleExports() { return module; };\n/******/ \t\t__webpack_require__.d(getter, 'a', getter);\n/******/ \t\treturn getter;\n/******/ \t};\n/******/\n/******/ \t// Object.prototype.hasOwnProperty.call\n/******/ \t__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n/******/\n/******/ \t// __webpack_public_path__\n/******/ \t__webpack_require__.p = \"\";\n/******/\n/******/ \t// Load entry module and return exports\n/******/ \treturn __webpack_require__(__webpack_require__.s = 3);\n/******/ })\n/************************************************************************/\n/******/ ([\n/* 0 */\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n\n// image preprocessing functions\n\nfunction getPixelComponent(imageData, x, y, colorIdx) {\n  return imageData.data[(y * imageData.width + x) * 4 + colorIdx];\n}\n// function putPixel(imageData, x, y, r, g, b, a) {\n//   a = a || 255;\n//   imageData.data[(y * imageData.width + x) * 4 + 0] = r;\n//   imageData.data[(y * imageData.width + x) * 4 + 1] = g;\n//   imageData.data[(y * imageData.width + x) * 4 + 2] = b;\n//   imageData.data[(y * imageData.width + x) * 4 + 3] = a;\n// }\nfunction getRect(imageData, x, y, width, height) {\n  var data = new Uint8ClampedArray(width * height * 4);\n\n  for (var row = y; row < y + height; row++) {\n    var begin = (row * imageData.width + x) * 4;\n    var end = begin + width * 4;\n    var dataRow = imageData.data.slice(begin, end);\n    var offset = (row - y) * width * 4;\n\n    data.set(dataRow, offset);\n  }\n  return new ImageData(data, width, height);\n}\nfunction getRow(imageData, y) {\n  var begin = y * imageData.width * 4;\n  var end = begin + imageData.width * 4;\n  var data = imageData.data.slice(begin, end);\n\n  return new ImageData(data, imageData.width, 1);\n}\n\n/*\r\n * @param imgData: ImageData\r\n */\nfunction convertToGrayscale(imgData) {\n  var w = imgData.width;\n  var h = imgData.height;\n  var graySum = 0;\n  var newImgData = new ImageData(imgData.width, imgData.height);\n  var buf = new ArrayBuffer(newImgData.data.length);\n  var buf8 = new Uint8ClampedArray(buf);\n  var buf32 = new Uint32Array(buf);\n\n  for (var row = 0; row < h; row++) {\n    for (var col = 0; col < w; col++) {\n      // gray = 0.299*r + 0.587*g + 0.114*b\n      var red = getPixelComponent(imgData, col, row, 0),\n          green = getPixelComponent(imgData, col, row, 1),\n          blue = getPixelComponent(imgData, col, row, 2);\n      var gray = parseInt(0.299 * red + 0.587 * green + 0.114 * blue, 10);\n      // putPixel(newImgData, col, row, gray, gray, gray);\n\n      buf32[row * w + col] = 255 << 24 | // alpha\n      gray << 16 | // blue\n      gray << 8 | // green\n      gray; // red\n      graySum += gray;\n    }\n  }\n  newImgData.data.set(buf8);\n\n  // return { array: array, threshold: (graySum / (w * h)) };\n  return { imgData: newImgData, threshold: graySum / (w * h) };\n}\n\nfunction gradientSimple(imgData, operator) {\n  // parameters of operator\n  // const side = Math.round(Math.sqrt(operator.length));\n  // const halfSide = Math.floor(side / 2);\n\n  // width/height of the image data\n  var w = imgData.width;\n  var h = imgData.height;\n  // destination array for output and temporary arrays for filling\n  var dst = [];\n  var newImgData = new ImageData(imgData.width, imgData.height);\n  var buf = new ArrayBuffer(newImgData.data.length);\n  var buf8 = new Uint8ClampedArray(buf);\n  var buf32 = new Uint32Array(buf);\n\n  var tempLine = [];\n  // gradient sum\n  var gradSum = 0;\n\n  // parse through all pixels\n  var y, x;\n\n  for (y = 0; y < h; y++) {\n    tempLine = [];\n\n    for (x = 0; x < w; x++) {\n      // calculate neighbor pixels, escape out of bounds indexes\n      var xLeft = Math.max(0, x - 1);\n      var xRight = Math.min(w - 1, x + 1);\n      var yUp = Math.max(0, y - 1);\n      var yDown = Math.min(h - 1, y + 1);\n\n      // simple gradient (equation 19, page 49)\n      var vr = getPixelComponent(imgData, xRight, y, 0),\n          vl = getPixelComponent(imgData, xLeft, y, 0),\n          vd = getPixelComponent(imgData, x, yDown, 0),\n          vu = getPixelComponent(imgData, x, yUp, 0);\n      var gradX = Math.abs(vr - vl);\n      var gradY = Math.abs(vd - vu);\n      var gradient = parseInt((gradX + gradY) / 2, 10);\n\n      gradSum = gradSum + gradient;\n\n      // calculate angles\n      // let angle = parseInt((Math.atan(gradY / gradX) * 180) / Math.PI);\n      var angle = parseInt((gradX === 0 ? 0 : Math.atan(gradY / gradX)) * 180 / Math.PI, 10);\n      var q = gradX >= 0 && gradY >= 0 ? 1 : -1;\n\n      // set gradient value for destination pixel\n      gradient = Math.abs(gradient);\n      // putPixel(newImgData, x, y, gradient, gradient, gradient);\n      buf32[y * w + x] = 255 << 24 | // alpha\n      gradient << 16 | // blue\n      gradient << 8 | // green\n      gradient; // red\n\n      tempLine.push([angle, q]);\n    }\n    dst.push(tempLine);\n  }\n  newImgData.data.set(buf8);\n\n  return { imgData: newImgData, gradient: dst, threshold: gradSum / (w * h) };\n}\n\n/*\r\n * @param imgData: ImageData\r\n * @param threshold: number\r\n */\nfunction binarize(imgData, threshold) {\n  var w = imgData.width;\n  var h = imgData.height;\n  var newImgData = new ImageData(imgData.width, imgData.height);\n  var buf = new ArrayBuffer(newImgData.data.length);\n  var buf8 = new Uint8ClampedArray(buf);\n  var buf32 = new Uint32Array(buf);\n\n  for (var row = 0; row < h; row++) {\n    for (var col = 0; col < w; col++) {\n      // gray = 0.299*r + 0.587*g + 0.114*b\n      var red = getPixelComponent(imgData, col, row, 0);\n      var value = red >= threshold ? 255 : 0;\n      // putPixel(newImgData, col, row, value, value, value);\n\n      buf32[row * w + col] = 255 << 24 | // alpha\n      value << 16 | // blue\n      value << 8 | // green\n      value; // red\n    }\n  }\n  newImgData.data.set(buf8);\n\n  return newImgData;\n}\n\nfunction gradientAndBinarize(imgData, gradSobelX) {\n  var gradientResult = gradientSimple(imgData, gradSobelX);\n  var binImgData = binarize(gradientResult.imgData, gradientResult.threshold);\n\n  // image data was transformed,\n  // return meta gradient info\n  return { imgData: binImgData, gradient: gradientResult.gradient };\n}\n\n// Just return a value to define the module export.\n// This example returns an object, but the module\n// can return a function as the exported value.\nmodule.exports = {\n  getRect: getRect,\n  getRow: getRow,\n  convertToGrayscale: convertToGrayscale,\n  gradientSimple: gradientSimple,\n  binarize: binarize,\n  gradientAndBinarize: gradientAndBinarize\n};\n\n/***/ }),\n/* 1 */\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n\n// RLE decoding functions\n\n// function getPixelComponent(imageData, x, y, colorIdx) {\n//   return imageData.data[(y * imageData.width + x) * 4 + colorIdx];\n// }\n\nfunction runLengthEncoding(row) {\n  var w = row.length;\n  var result = [];\n  var previous = null;\n  var n = 0;\n\n  var x, current;\n\n  for (x = 0; x < w; x++) {\n    current = row[x];\n\n    if (current !== previous && previous != null) {\n      result.push({ val: previous, len: n });\n      n = 0;\n    }\n    n++;\n    previous = current;\n  }\n\n  if (n > 0) {\n    result.push({ val: previous, len: n });\n  }\n\n  var length = result.length;\n  var start = result[0].val === 255 ? 1 : 0;\n  var end = result[length - 1].val === 255 ? length - 1 : length;\n\n  return result.slice(start, end);\n}\n\nfunction sliceDigits(rle) {\n  var units = 59;\n  var result = [];\n  var digits = [];\n  var dsize = 4; // bars per digit (2 black, 2 white)\n  var outer = 3; // outer guards (black, white, black)\n  var inner = 5; // inner guard (white, black, white, black, white)\n\n  var m, i;\n\n  // test, if units is bigger than\n  if (rle.length >= units) {\n    var possibilites = rle.length - units + 1;\n\n    for (m = 0; m < possibilites; m++) {\n      digits = [];\n\n      for (i = 0; i < 6; i++) {\n        var pos = m + outer + i * dsize;\n        var digit = rle.slice(pos, pos + dsize);\n\n        digits.push(digit);\n      }\n\n      for (i = 6; i < 12; i++) {\n        var _pos = m + outer + inner + i * dsize;\n        var _digit = rle.slice(_pos, _pos + dsize);\n\n        digits.push(_digit);\n      }\n\n      result.push(digits);\n    }\n  }\n\n  return result;\n}\n\nfunction normalizeDigits(digits) {\n  var normalization = [];\n  var sum;\n\n  for (var d in digits) {\n    var digit = digits[d];\n    sum = 0;\n\n    for (var m in digit) {\n      var _module = digit[m];\n      sum += _module.len;\n    }\n\n    var row = [];\n\n    for (var _m in digit) {\n      row.push(digit[_m].len / sum);\n    }\n    normalization.push(row);\n  }\n  return normalization;\n}\n\nfunction mod(a, n) {\n  return (a % n + n) % n;\n}\n\nfunction findSimilarNumbers(normalization) {\n  /* eslint-disable max-len */\n  var defaults = {\n    leftDigitsOdd: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],\n    leftDigitsEven: [[1, 1, 2, 3], [1, 2, 2, 2], [2, 2, 1, 2], [1, 1, 4, 1], [2, 3, 1, 1], [1, 3, 2, 1], [4, 1, 1, 1], [2, 1, 3, 1], [3, 1, 2, 1], [2, 1, 1, 3]],\n    rightDigits: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],\n    parity: ['OOOOOO', 'OOEOEE', 'OOEEOE', 'OOEEEO', 'OEOOEE', 'OEEOOE', 'OEEEOO', 'OEOEOE', 'OEOEEO', 'OEEOEO']\n  };\n  /* eslint-enable max-len */\n\n  var sum;\n  var i, j;\n\n  // convert EAN tables\n  for (i in defaults.leftDigitsOdd) {\n    var digit = defaults.leftDigitsOdd[i];\n    sum = 0;\n\n    for (var m in digit) {\n      sum += digit[m];\n    }\n\n    for (var _m2 in digit) {\n      digit[_m2] = digit[_m2] / sum;\n    }\n  }\n\n  for (i in defaults.leftDigitsEven) {\n    var _digit2 = defaults.leftDigitsEven[i];\n    sum = 0;\n\n    for (var _m3 in _digit2) {\n      sum += _digit2[_m3];\n    }\n\n    for (var _m4 in _digit2) {\n      _digit2[_m4] = _digit2[_m4] / sum;\n    }\n  }\n\n  for (i in defaults.rightDigits) {\n    var _digit3 = defaults.rightDigits[i];\n    sum = 0;\n\n    for (var _m5 in _digit3) {\n      sum += _digit3[_m5];\n    }\n\n    for (var _m6 in _digit3) {\n      _digit3[_m6] = _digit3[_m6] / sum;\n    }\n  }\n\n  // check for similarity\n  var result = [];\n  // left digits\n  var difference;\n\n  for (i = 0; i < 6; i++) {\n    var _digit4 = normalization[i];\n    var digitSim = [];\n\n    for (var o in defaults.leftDigitsOdd) {\n      var template = defaults.leftDigitsOdd[o];\n      difference = 0;\n\n      for (j = 0; j < 4; j++) {\n        difference += Math.abs(template[j] - _digit4[j]);\n      }\n      digitSim.push(difference);\n    }\n    result.push({ odd: digitSim, even: 0 });\n\n    digitSim = [];\n    for (var _o in defaults.leftDigitsEven) {\n      var _template = defaults.leftDigitsEven[_o];\n      difference = 0;\n\n      for (j = 0; j < 4; j++) {\n        difference += Math.abs(_template[j] - _digit4[j]);\n      }\n      digitSim.push(difference);\n    }\n    result[i].even = digitSim;\n  }\n\n  // right digits\n  for (i = 6; i < 12; i++) {\n    var _digit5 = normalization[i];\n    var _digitSim = [];\n\n    for (var _o2 in defaults.rightDigits) {\n      var _template2 = defaults.rightDigits[_o2];\n      difference = 0;\n\n      for (j = 0; j < 4; j++) {\n        difference += Math.abs(_template2[j] - _digit5[j]);\n      }\n      _digitSim.push(difference);\n    }\n    result.push({ odd: 0, even: _digitSim });\n  }\n\n  var parity = '';\n  var EAN = '';\n\n  for (var r in result) {\n    var _digit6 = result[r];\n    var number = 0;\n\n    if (r < 6) {\n      var oddMin = Math.min.apply(Math, _digit6.odd);\n      var odd = _digit6.odd.indexOf(oddMin);\n\n      var evenMin = Math.min.apply(Math, _digit6.even);\n      var even = _digit6.even.indexOf(evenMin);\n\n      if (oddMin < evenMin) {\n        number = odd;\n        parity += 'O';\n      } else {\n        number = even;\n        parity += 'E';\n      }\n    } else {\n      number = _digit6.even.indexOf(Math.min.apply(Math, _digit6.even));\n    }\n\n    EAN += number.toString();\n  }\n\n  // calculate first digit from parity!!!\n  var firstDigit = defaults.parity.indexOf(parity).toString();\n  if (parseInt(firstDigit, 10) < 0) {\n    EAN = 'false';\n  } else {\n    EAN = firstDigit + EAN;\n\n    var checksum = 0;\n    for (i = 0; i < 12; i++) {\n      checksum += EAN[i] * (mod(i + 1, 2) ? 1 : 3);\n    }\n\n    if (!mod(10 - mod(checksum, 10), 10) === parseInt(EAN[12], 10)) {\n      EAN = 'false';\n    }\n  }\n\n  return EAN;\n}\n\nmodule.exports = {\n  runLengthEncoding: runLengthEncoding,\n  sliceDigits: sliceDigits,\n  normalizeDigits: normalizeDigits,\n  findSimilarNumbers: findSimilarNumbers\n};\n\n/***/ }),\n/* 2 */\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n\n// SLA localization functions\n\nfunction getPixelComponent(imageData, x, y, colorIdx) {\n  return imageData.data[(y * imageData.width + x) * 4 + colorIdx];\n}\n\nfunction findScanlines(imgData, gradient, SLASteps, SlaParams) {\n  // width/height of the image data\n  var w = imgData.width;\n  var h = imgData.height;\n  // var max = Math.max(array.length, array[0].length);\n  var max = w; // take width because of horizontal barcodes\n\n  // set parameters depending on image dimensions\n  var steps = Math.floor(h / (h * SLASteps));\n  var MaxDist = max * SlaParams.maxDist / 100;\n  var MinLength = max * SlaParams.minLength / 100;\n\n  // store result for scanline\n  var resultSLs = [];\n\n  for (var row = 0; row < h; row += steps) {\n\n    for (var pixel = 0; pixel < w - MinLength; pixel++) {\n\n      // test if gradient pixel\n      if (getPixelComponent(imgData, pixel, row, 0) === 255) {\n        var angle = gradient[row][pixel][0];\n        var angleSum = angle;\n        var scanlineLength = 0,\n            foundSomething = 1,\n            nothingFound = 0;\n        var scanline = { x: null, y: null, scanlineLength: 0, angleAVG: null };\n\n        for (var i = pixel + 1; i < w; i++) {\n          // loop 1\n          scanlineLength++;\n\n          // test if gradient and increase counter if similar\n          var othPixelValue = getPixelComponent(imgData, i, row, 0);\n          var othAngle = gradient[row][i][0];\n          if (othPixelValue === 255 && othAngle >= angle - SlaParams.angleDiff && othAngle <= angle + SlaParams.angleDiff) {\n            foundSomething++;\n            angleSum = angleSum + othAngle;\n            nothingFound = 0;\n          } else {\n            nothingFound++;\n          }\n\n          // test for thresholds\n          // if exceeds maxDistance or is last pixel of row\n          if (nothingFound > MaxDist || i === w - 1) {\n            if (foundSomething >= SlaParams.minGradient) {\n              scanline = {\n                x: pixel,\n                y: row,\n                scanlineLength: scanlineLength - nothingFound,\n                angleAVG: parseInt(angleSum / foundSomething, 10)\n              };\n            }\n            break;\n          }\n        } // end loop 1\n\n        if (scanline.scanlineLength >= MinLength) {\n          resultSLs.push(scanline);\n        }\n\n        // set pixel, where to start from after this search\n        pixel = Math.min(w - 1, pixel + scanline.scanlineLength);\n      }\n    }\n  }\n\n  return resultSLs;\n}\n\nfunction findPBCAfromSLs(width, scanlines, SlaParams) {\n  var PBCAs = [];\n\n  // var max = Math.max(imageData.height, imageData.width);\n  var max = width; // take width because of horizontal barcodes\n\n  var MaxSLDist = max * SlaParams.maxSLDist / 100;\n  var MaxLengthDiff = max * SlaParams.maxLengthDiff / 100;\n  var MaxSLDiffX = max * SlaParams.maxSLDiffX / 100;\n\n  // parse all SLs, but don't consider last, when there aren't enough for SlaParams.maxSLNumber\n  for (var i = 0; i < scanlines.length - SlaParams.minSLNumber; i++) {\n    var SL = scanlines[i];\n    var length = SL.scanlineLength;\n    var angle = SL.angleAVG;\n    var refPointX = SL.x;\n    var refPointY = SL.y;\n    // reset PBCA and fill with current SL\n    var tempPBCA = [];\n    tempPBCA.push(SL);\n    // next scanline to process, if PBCA is found\n    var next = i;\n\n    for (var j = i + 1; j < scanlines.length; j++) {\n      var nSL = scanlines[j];\n\n      // test if SL is within range\n      if (nSL.y <= refPointY + MaxSLDist) {\n\n        // test if angle is similar and length is similar to previous\n        if (nSL.y !== refPointY && // Y coordinate different ?\n        nSL.x >= refPointX - MaxSLDiffX && nSL.x <= refPointX + MaxSLDiffX && nSL.angleAVG >= angle - SlaParams.angleDiff && nSL.angleAVG <= angle + SlaParams.angleDiff && nSL.scanlineLength >= length - MaxLengthDiff && nSL.scanlineLength <= length + MaxLengthDiff) {\n\n          // put SL into PBCA\n          tempPBCA.push(nSL);\n          next = j;\n\n          // set adapted length and angle to compare with next line\n          length = nSL.scanlineLength;\n          angle = nSL.angleAVG;\n          refPointX = nSL.x;\n          refPointY = nSL.y;\n        }\n      } else {\n        // break because they are sorted by Y and following will be out of range\n        break;\n      }\n    }\n\n    // store temporary PBCA in result, if enough SLs where found\n    if (tempPBCA.length >= SlaParams.minSLNumber) {\n      PBCAs.push(tempPBCA);\n    } else {\n      next = i;\n    }\n    i = next;\n  }\n\n  return PBCAs;\n}\n\n/**\r\n * @param imgData: ImageData\r\n * @param gradient: Array of [angle, q]\r\n * @param SLASteps: number\r\n * @param SlaParams: object\r\n */\nfunction localizationSLA(imgData, gradient, SLASteps, SlaParams) {\n  // calulate border aroung barcode image\n  // var max = Math.max(imageData.height, imageData.width);\n  var max = imgData.width; // take width because of horizontal barcodes\n  var borderX = Math.floor(max * SlaParams.locBorder / 100);\n  var borderY = 0; // (max * locBorder) / 100;\n\n  // find scanlines that fit into requirements\n  var scanlines = findScanlines(imgData, gradient, SLASteps, SlaParams);\n\n  // compare scanlines\n  var areas = findPBCAfromSLs(imgData.width, scanlines, SlaParams);\n\n  // edit areas for returning results\n  // var areaSize = 0;\n  var result = [];\n  for (var ba in areas) {\n    var area = areas[ba];\n    var startX = [],\n        endX = [],\n        Y = [];\n\n    for (var s in area) {\n      var sl = area[s];\n      startX.push(sl.x);\n      endX.push(sl.x + sl.scanlineLength);\n      Y.push(sl.y);\n    }\n\n    result.push({\n      startX: Math.min.apply(null, startX) - borderX,\n      endX: Math.max.apply(null, endX) + borderX,\n      startY: Math.min.apply(null, Y) - borderY,\n      endY: Math.max.apply(null, Y) + borderY\n    });\n  }\n\n  return result;\n}\n\nmodule.exports = {\n  findScanlines: findScanlines,\n  findPBCAfromSLs: findPBCAfromSLs,\n  localizationSLA: localizationSLA\n};\n\n/***/ }),\n/* 3 */\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n\nvar _Img = __webpack_require__(0);\n\nvar Img = _interopRequireWildcard(_Img);\n\nvar _RLE = __webpack_require__(1);\n\nvar RLE = _interopRequireWildcard(_RLE);\n\nvar _SLA = __webpack_require__(2);\n\nvar SLA = _interopRequireWildcard(_SLA);\n\nfunction _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }\n\n// self.importScripts('Img.js', 'SLA.js', 'RLE.js');\n\nvar debug = false; /* --------------------------------------------------\r\n                   \r\n                   SlaRle.js by BobbyJay <https://github.com/BobbyJay/SlaRle.js>\r\n                   \r\n                   This software is provided under the MIT license, http://opensource.org/licenses/MIT.\r\n                   All use of this software must include this\r\n                   text, including the reference to the creator of the original source code. The\r\n                   originator accepts no responsibility of any kind pertaining to\r\n                   use of this software.\r\n                   \r\n                   Copyright (c) 2015 BobbyJay\r\n                   \r\n                   Permission is hereby granted, free of charge, to any person obtaining a copy\r\n                   of this software and associated documentation files (the \"Software\"), to deal\r\n                   in the Software without restriction, including without limitation the rights\r\n                   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n                   copies of the Software, and to permit persons to whom the Software is\r\n                   furnished to do so, subject to the following conditions:\r\n                   \r\n                   The above copyright notice and this permission notice shall be included in\r\n                   all copies or substantial portions of the Software.\r\n                   \r\n                   THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n                   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n                   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n                   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n                   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n                   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\r\n                   THE SOFTWARE.\r\n                   \r\n                   ------------------------ */\n\n/* eslint-disable no-unused-vars */\n/* global self:true */\n/* global onmessage:true */\n\nvar locBorder = 0; // 3;\t// additional border for located barcode in %\n\nvar SLs = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9];\n\n// Sobel gradient operator\nvar GRAD_SOBEL_X = [-1, 0, 1, -2, 0, 2, -1, 0, 1];\nvar GRAD_SOBEL_Y = [-1, -2, -1, 0, 0, 0, 1, 2, 1];\n\n// SLA algorithm parameters\n// limits and performance optimizations for scanlines\nvar SLA_STEPS = 1 / 3; // steps to jump over image rows, shows the amount of rows that will be parsed in %\n// const SLA_LIMIT_X = 20;\n// const SLA_LIMIT_Y = 20;\n\n// parameters\nvar SLA_PARAMS = {\n  locBorder: locBorder,\n  angleDiff: 11, // difference of angles for gradients and SLs\n  maxDist: 1.7, // 3, // min gradient distance in %\n  minLength: 17, // min SL length in % of image width\n  minGradient: 100, // 44 is the limit theoretically, min amount of gradients in SL\n  maxSLDist: 1.5, // max scanline distance in %\n  maxLengthDiff: 2, // max SL length difference in %\n  maxSLDiffX: 2, // max difference of start point X of SL in %\n  minSLNumber: parseInt(25 * SLA_STEPS, 10) };\n\n// receive trigger from program\n// initiate the localization algorithm\nself.onmessage = function (e) {\n  if (e.data.imgData) {\n\n    // ---------------\n    // LOCALIZATION\n    // ---------------\n    // convert to grayscale image\n    var grayscaleRes = Img.convertToGrayscale(e.data.imgData);\n\n    // use gradient operator\n    var gradientRes = Img.gradientAndBinarize(grayscaleRes.imgData, GRAD_SOBEL_X);\n\n    // start localization\n    var PBCAs = [];\n    PBCAs = SLA.localizationSLA(gradientRes.imgData, gradientRes.gradient, SLA_STEPS, SLA_PARAMS);\n    gradientRes.imgData = null;\n    gradientRes.gradient = null;\n    gradientRes = null;\n\n    // return biggest PBCA for localization comparison (Jaccard)\n    var areaSize = 0;\n    var result = [];\n    for (var ba in PBCAs) {\n      var pbca = PBCAs[ba];\n\n      var area = Math.max(0, pbca.endX - pbca.startX) * Math.max(0, pbca.endY - pbca.startY);\n\n      if (area > areaSize) {\n        areaSize = area;\n        result = [];\n        result.push(pbca);\n      }\n    }\n    // postMessage({ type:'localization', areas: result });\n\n    // -----------\n    // DECODING\n    // -----------\n\n    var EANs = [];\n    var PBCAImgData = void 0;\n    for (var p in PBCAs) {\n      var EAN = 'false';\n      var PBCA = PBCAs[p];\n\n      // slicing imageArrayGray.array to PBCA size\n      PBCAImgData = Img.getRect(grayscaleRes.imgData, PBCA.startX, PBCA.startY, PBCA.endX - PBCA.startX, PBCA.endY - PBCA.startY);\n\n      // decoding for each scanline\n      for (var s in SLs) {\n        var idx = Math.floor(PBCAImgData.height * SLs[s]);\n        var rowImgData = Img.getRow(PBCAImgData, idx);\n        var sum = rowImgData.data.reduce(function (acc, val, idx) {\n          return idx % 4 === 0 ? acc + val : acc;\n        }, 0);\n\n        // select grayscale scanline\n        var sl = Img.binarize(rowImgData, sum / rowImgData.width);\n\n        var row = new Uint8ClampedArray(rowImgData.width);\n        sl.data.reduce(function (acc, val, idx) {\n          if (idx % 4 === 0) {\n            acc[idx / 4] = val;\n          }\n          return acc;\n        }, row);\n        // RLEncoding the scanline\n        var rle = RLE.runLengthEncoding(row);\n        var rows = RLE.sliceDigits(rle);\n\n        for (var r in rows) {\n          var digits = rows[r];\n\n          if (digits.length === 12) {\n            var normalization = RLE.normalizeDigits(digits);\n            EAN = RLE.findSimilarNumbers(normalization);\n            if (EAN !== 'false') {\n              EANs.push(EAN);\n              break;\n            }\n          } else {\n            EAN = 'false';\n          }\n        }\n\n        if (EAN !== 'false') {\n          break;\n        }\n      } // end parsing all Scanlines SLs\n\n      // if (EAN != \"false\") {\n      //\tbreak;\n      // }\n    } // end parsing all PBCAs\n\n    // ---------\n    // RESULTS\n    // ---------\n\n    grayscaleRes.imgData = null;\n    PBCAs = null;\n    PBCAImgData = null;\n    result = null;\n\n    postMessage({ type: 'decoding', id: e.data.id, payload: { EAN: EANs } });\n  } else {\n    postMessage({ type: 'decoding', id: e.data.id, payload: { EAN: [] } });\n  }\n};\n\n// signal that the worker is ready\npostMessage({ type: 'status', payload: { status: 'ready' } });\n\n/***/ })\n/******/ ]);\n//# sourceMappingURL=6fe42a8701afa678ca21.worker.js.map", __webpack_require__.p + "6fe42a8701afa678ca21.worker.js");
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// Web Worker
// let url = new URL("../../src/SlaRleWorker.js", window.location);
// var SlaRleWorker = new Worker(url.toString());
var SlaRleWorker = __webpack_require__(0);

var worker = new SlaRleWorker();

var msgId = 0;
var decodeCbs = {};
var onInit = function onInit(err) {
  console.log(err);
};

function handleDecodeResult(id, payload) {
  if (!decodeCbs[id]) {
    return;
  }

  // create result object
  var res = {
    reqId: id,
    codes: []
  };

  if (payload.EAN && payload.EAN.length > 0) {
    res.codes = payload.EAN.map(function (code, idx) {
      return {
        value: code,
        format: 'EAN'
      };
    });
  }

  decodeCbs[id](res);
  delete decodeCbs[id];
}

function handleStatusUpdate(payload) {
  if (payload.status === 'ready') {
    onInit(null);
  }
}

// receive worker messages
function handleWwMessage(e) {
  console.log('received', e.data.type);

  switch (e.data.type) {
    case 'decoding':
      handleDecodeResult(e.data.id, e.data.payload);
      break;
    case 'status':
      handleStatusUpdate(e.data.payload);
      break;
    default:
      break;
  }
}

/**
 * cb: (err: Error) => void
 */
function init(cb) {
  onInit = cb;
  worker.onmessage = handleWwMessage;
}

/*
 * @param imgData: ImageData
 * @param cb: (results: string[]) => void
 * @return number
 */
function decode(imgData, cb) {
  // prepare message
  var id = msgId++;

  var message = {
    id: id,
    imgData: imgData
  };

  decodeCbs[id] = cb;
  worker.postMessage(message);
  message = null;
  return id;
}

exports.default = {
  init: init,
  decode: decode
};
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string

var URL = window.URL || window.webkitURL;
module.exports = function(content, url) {
  try {
    try {
      var blob;
      try { // BlobBuilder = Deprecated, but widely implemented
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
        blob = new BlobBuilder();
        blob.append(content);
        blob = blob.getBlob();
      } catch(e) { // The proposed API
        blob = new Blob([content]);
      }
      return new Worker(URL.createObjectURL(blob));
    } catch(e) {
      return new Worker('data:application/javascript,' + encodeURIComponent(content));
    }
  } catch(e) {
    if (!url) {
      throw Error('Inline worker is not supported');
    }
    return new Worker(url);
  }
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=Debarcode.js.map