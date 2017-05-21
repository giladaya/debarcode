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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
// function putPixel(imageData, x, y, r, g, b, a) {
//   a = a || 255;
//   imageData.data[(y * imageData.width + x) * 4 + 0] = r;
//   imageData.data[(y * imageData.width + x) * 4 + 1] = g;
//   imageData.data[(y * imageData.width + x) * 4 + 2] = b;
//   imageData.data[(y * imageData.width + x) * 4 + 3] = a;
// }
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
      var gray = parseInt(0.299 * red + 0.587 * green + 0.114 * blue, 10);
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
  // const side = Math.round(Math.sqrt(operator.length));
  // const halfSide = Math.floor(side / 2);

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
  var y, x;

  for (y = 0; y < h; y++) {
    tempLine = [];

    for (x = 0; x < w; x++) {
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
      var gradient = parseInt((gradX + gradY) / 2, 10);

      gradSum = gradSum + gradient;

      // calculate angles
      // let angle = parseInt((Math.atan(gradY / gradX) * 180) / Math.PI);
      var angle = parseInt((gradX === 0 ? 0 : Math.atan(gradY / gradX)) * 180 / Math.PI, 10);
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


// RLE decoding functions

// function getPixelComponent(imageData, x, y, colorIdx) {
//   return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
// }

function runLengthEncoding(row) {
  var w = row.length;
  var result = [];
  var previous = null;
  var n = 0;

  var x, current;

  for (x = 0; x < w; x++) {
    current = row[x];

    if (current !== previous && previous != null) {
      result.push({ val: previous, len: n });
      n = 0;
    }
    n++;
    previous = current;
  }

  if (n > 0) {
    result.push({ val: previous, len: n });
  }

  var length = result.length;
  var start = result[0].val === 255 ? 1 : 0;
  var end = result[length - 1].val === 255 ? length - 1 : length;

  return result.slice(start, end);
}

function sliceDigits(rle) {
  var units = 59;
  var result = [];
  var digits = [];
  var dsize = 4; // bars per digit (2 black, 2 white)
  var outer = 3; // outer guards (black, white, black)
  var inner = 5; // inner guard (white, black, white, black, white)

  var m, i;

  // test, if units is bigger than
  if (rle.length >= units) {
    var possibilites = rle.length - units + 1;

    for (m = 0; m < possibilites; m++) {
      digits = [];

      for (i = 0; i < 6; i++) {
        var pos = m + outer + i * dsize;
        var digit = rle.slice(pos, pos + dsize);

        digits.push(digit);
      }

      for (i = 6; i < 12; i++) {
        var _pos = m + outer + inner + i * dsize;
        var _digit = rle.slice(_pos, _pos + dsize);

        digits.push(_digit);
      }

      result.push(digits);
    }
  }

  return result;
}

function normalizeDigits(digits) {
  var normalization = [];
  var sum;

  for (var d in digits) {
    var digit = digits[d];
    sum = 0;

    for (var m in digit) {
      var _module = digit[m];
      sum += _module.len;
    }

    var row = [];

    for (var _m in digit) {
      row.push(digit[_m].len / sum);
    }
    normalization.push(row);
  }
  return normalization;
}

function mod(a, n) {
  return (a % n + n) % n;
}

function findSimilarNumbers(normalization) {
  /* eslint-disable max-len */
  var defaults = {
    leftDigitsOdd: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
    leftDigitsEven: [[1, 1, 2, 3], [1, 2, 2, 2], [2, 2, 1, 2], [1, 1, 4, 1], [2, 3, 1, 1], [1, 3, 2, 1], [4, 1, 1, 1], [2, 1, 3, 1], [3, 1, 2, 1], [2, 1, 1, 3]],
    rightDigits: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
    parity: ['OOOOOO', 'OOEOEE', 'OOEEOE', 'OOEEEO', 'OEOOEE', 'OEEOOE', 'OEEEOO', 'OEOEOE', 'OEOEEO', 'OEEOEO']
  };
  /* eslint-enable max-len */

  var sum;
  var i, j;

  // convert EAN tables
  for (i in defaults.leftDigitsOdd) {
    var digit = defaults.leftDigitsOdd[i];
    sum = 0;

    for (var m in digit) {
      sum += digit[m];
    }

    for (var _m2 in digit) {
      digit[_m2] = digit[_m2] / sum;
    }
  }

  for (i in defaults.leftDigitsEven) {
    var _digit2 = defaults.leftDigitsEven[i];
    sum = 0;

    for (var _m3 in _digit2) {
      sum += _digit2[_m3];
    }

    for (var _m4 in _digit2) {
      _digit2[_m4] = _digit2[_m4] / sum;
    }
  }

  for (i in defaults.rightDigits) {
    var _digit3 = defaults.rightDigits[i];
    sum = 0;

    for (var _m5 in _digit3) {
      sum += _digit3[_m5];
    }

    for (var _m6 in _digit3) {
      _digit3[_m6] = _digit3[_m6] / sum;
    }
  }

  // check for similarity
  var result = [];
  // left digits
  var difference;

  for (i = 0; i < 6; i++) {
    var _digit4 = normalization[i];
    var digitSim = [];

    for (var o in defaults.leftDigitsOdd) {
      var template = defaults.leftDigitsOdd[o];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(template[j] - _digit4[j]);
      }
      digitSim.push(difference);
    }
    result.push({ odd: digitSim, even: 0 });

    digitSim = [];
    for (var _o in defaults.leftDigitsEven) {
      var _template = defaults.leftDigitsEven[_o];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(_template[j] - _digit4[j]);
      }
      digitSim.push(difference);
    }
    result[i].even = digitSim;
  }

  // right digits
  for (i = 6; i < 12; i++) {
    var _digit5 = normalization[i];
    var _digitSim = [];

    for (var _o2 in defaults.rightDigits) {
      var _template2 = defaults.rightDigits[_o2];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(_template2[j] - _digit5[j]);
      }
      _digitSim.push(difference);
    }
    result.push({ odd: 0, even: _digitSim });
  }

  var parity = '';
  var EAN = '';

  for (var r in result) {
    var _digit6 = result[r];
    var number = 0;

    if (r < 6) {
      var oddMin = Math.min.apply(Math, _digit6.odd);
      var odd = _digit6.odd.indexOf(oddMin);

      var evenMin = Math.min.apply(Math, _digit6.even);
      var even = _digit6.even.indexOf(evenMin);

      if (oddMin < evenMin) {
        number = odd;
        parity += 'O';
      } else {
        number = even;
        parity += 'E';
      }
    } else {
      number = _digit6.even.indexOf(Math.min.apply(Math, _digit6.even));
    }

    EAN += number.toString();
  }

  // calculate first digit from parity!!!
  var firstDigit = defaults.parity.indexOf(parity).toString();
  if (parseInt(firstDigit, 10) < 0) {
    EAN = 'false';
  } else {
    EAN = firstDigit + EAN;

    var checksum = 0;
    for (i = 0; i < 12; i++) {
      checksum += EAN[i] * (mod(i + 1, 2) ? 1 : 3);
    }

    if (!mod(10 - mod(checksum, 10), 10) === parseInt(EAN[12], 10)) {
      EAN = 'false';
    }
  }

  return EAN;
}

module.exports = {
  runLengthEncoding: runLengthEncoding,
  sliceDigits: sliceDigits,
  normalizeDigits: normalizeDigits,
  findSimilarNumbers: findSimilarNumbers
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// SLA localization functions

function getPixelComponent(imageData, x, y, colorIdx) {
  return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
}

function findScanlines(imgData, gradient, SLASteps, SlaParams) {
  // width/height of the image data
  var w = imgData.width;
  var h = imgData.height;
  // var max = Math.max(array.length, array[0].length);
  var max = w; // take width because of horizontal barcodes

  // set parameters depending on image dimensions
  var steps = Math.floor(h / (h * SLASteps));
  var MaxDist = max * SlaParams.maxDist / 100;
  var MinLength = max * SlaParams.minLength / 100;

  // store result for scanline
  var resultSLs = [];

  for (var row = 0; row < h; row += steps) {

    for (var pixel = 0; pixel < w - MinLength; pixel++) {

      // test if gradient pixel
      if (getPixelComponent(imgData, pixel, row, 0) === 255) {
        var angle = gradient[row][pixel][0];
        var angleSum = angle;
        var scanlineLength = 0,
            foundSomething = 1,
            nothingFound = 0;
        var scanline = { x: null, y: null, scanlineLength: 0, angleAVG: null };

        for (var i = pixel + 1; i < w; i++) {
          // loop 1
          scanlineLength++;

          // test if gradient and increase counter if similar
          var othPixelValue = getPixelComponent(imgData, i, row, 0);
          var othAngle = gradient[row][i][0];
          if (othPixelValue === 255 && othAngle >= angle - SlaParams.angleDiff && othAngle <= angle + SlaParams.angleDiff) {
            foundSomething++;
            angleSum = angleSum + othAngle;
            nothingFound = 0;
          } else {
            nothingFound++;
          }

          // test for thresholds
          // if exceeds maxDistance or is last pixel of row
          if (nothingFound > MaxDist || i === w - 1) {
            if (foundSomething >= SlaParams.minGradient) {
              scanline = {
                x: pixel,
                y: row,
                scanlineLength: scanlineLength - nothingFound,
                angleAVG: parseInt(angleSum / foundSomething, 10)
              };
            }
            break;
          }
        } // end loop 1

        if (scanline.scanlineLength >= MinLength) {
          resultSLs.push(scanline);
        }

        // set pixel, where to start from after this search
        pixel = Math.min(w - 1, pixel + scanline.scanlineLength);
      }
    }
  }

  return resultSLs;
}

function findPBCAfromSLs(width, scanlines, SlaParams) {
  var PBCAs = [];

  // var max = Math.max(imageData.height, imageData.width);
  var max = width; // take width because of horizontal barcodes

  var MaxSLDist = max * SlaParams.maxSLDist / 100;
  var MaxLengthDiff = max * SlaParams.maxLengthDiff / 100;
  var MaxSLDiffX = max * SlaParams.maxSLDiffX / 100;

  // parse all SLs, but don't consider last, when there aren't enough for SlaParams.maxSLNumber
  for (var i = 0; i < scanlines.length - SlaParams.minSLNumber; i++) {
    var SL = scanlines[i];
    var length = SL.scanlineLength;
    var angle = SL.angleAVG;
    var refPointX = SL.x;
    var refPointY = SL.y;
    // reset PBCA and fill with current SL
    var tempPBCA = [];
    tempPBCA.push(SL);
    // next scanline to process, if PBCA is found
    var next = i;

    for (var j = i + 1; j < scanlines.length; j++) {
      var nSL = scanlines[j];

      // test if SL is within range
      if (nSL.y <= refPointY + MaxSLDist) {

        // test if angle is similar and length is similar to previous
        if (nSL.y !== refPointY && // Y coordinate different ?
        nSL.x >= refPointX - MaxSLDiffX && nSL.x <= refPointX + MaxSLDiffX && nSL.angleAVG >= angle - SlaParams.angleDiff && nSL.angleAVG <= angle + SlaParams.angleDiff && nSL.scanlineLength >= length - MaxLengthDiff && nSL.scanlineLength <= length + MaxLengthDiff) {

          // put SL into PBCA
          tempPBCA.push(nSL);
          next = j;

          // set adapted length and angle to compare with next line
          length = nSL.scanlineLength;
          angle = nSL.angleAVG;
          refPointX = nSL.x;
          refPointY = nSL.y;
        }
      } else {
        // break because they are sorted by Y and following will be out of range
        break;
      }
    }

    // store temporary PBCA in result, if enough SLs where found
    if (tempPBCA.length >= SlaParams.minSLNumber) {
      PBCAs.push(tempPBCA);
    } else {
      next = i;
    }
    i = next;
  }

  return PBCAs;
}

/**
 * @param imgData: ImageData
 * @param gradient: Array of [angle, q]
 * @param SLASteps: number
 * @param SlaParams: object
 */
function localizationSLA(imgData, gradient, SLASteps, SlaParams) {
  // calulate border aroung barcode image
  // var max = Math.max(imageData.height, imageData.width);
  var max = imgData.width; // take width because of horizontal barcodes
  var borderX = Math.floor(max * locBorder / 100);
  var borderY = 0; // (max * locBorder) / 100;

  // find scanlines that fit into requirements
  var scanlines = findScanlines(imgData, gradient, SLASteps, SlaParams);

  // compare scanlines
  var areas = findPBCAfromSLs(imgData.width, scanlines, SlaParams);

  // edit areas for returning results
  // var areaSize = 0;
  var result = [];
  for (var ba in areas) {
    var area = areas[ba];
    var startX = [],
        endX = [],
        Y = [];

    for (var s in area) {
      var sl = area[s];
      startX.push(sl.x);
      endX.push(sl.x + sl.scanlineLength);
      Y.push(sl.y);
    }

    result.push({
      startX: Math.min.apply(null, startX) - borderX,
      endX: Math.max.apply(null, endX) + borderX,
      startY: Math.min.apply(null, Y) - borderY,
      endY: Math.max.apply(null, Y) + borderY
    });
  }

  return result;
}

module.exports = {
  findScanlines: findScanlines,
  findPBCAfromSLs: findPBCAfromSLs,
  localizationSLA: localizationSLA
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Img = __webpack_require__(0);

var Img = _interopRequireWildcard(_Img);

var _RLE = __webpack_require__(1);

var RLE = _interopRequireWildcard(_RLE);

var _SLA = __webpack_require__(2);

var SLA = _interopRequireWildcard(_SLA);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// self.importScripts('Img.js', 'SLA.js', 'RLE.js');

var debug = false; /* --------------------------------------------------
                   
                   SlaRle.js by BobbyJay <https://github.com/BobbyJay/SlaRle.js>
                   
                   This software is provided under the MIT license, http://opensource.org/licenses/MIT.
                   All use of this software must include this
                   text, including the reference to the creator of the original source code. The
                   originator accepts no responsibility of any kind pertaining to
                   use of this software.
                   
                   Copyright (c) 2015 BobbyJay
                   
                   Permission is hereby granted, free of charge, to any person obtaining a copy
                   of this software and associated documentation files (the "Software"), to deal
                   in the Software without restriction, including without limitation the rights
                   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                   copies of the Software, and to permit persons to whom the Software is
                   furnished to do so, subject to the following conditions:
                   
                   The above copyright notice and this permission notice shall be included in
                   all copies or substantial portions of the Software.
                   
                   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                   THE SOFTWARE.
                   
                   ------------------------ */

/* eslint-disable no-unused-vars */
/* global self:true */
/* global onmessage:true */

var locBorder = 0; // 3;	// additional border for located barcode in %

var SLs = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9];

// Sobel gradient operator
var GRAD_SOBEL_X = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
var GRAD_SOBEL_Y = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

// SLA algorithm parameters
// limits and performance optimizations for scanlines
var SLA_STEPS = 1 / 3; // steps to jump over image rows, shows the amount of rows that will be parsed in %
// const SLA_LIMIT_X = 20;
// const SLA_LIMIT_Y = 20;

// parameters
var SLA_PARAMS = {
  locBorder: locBorder,
  angleDiff: 11, // difference of angles for gradients and SLs
  maxDist: 1.7, // 3, // min gradient distance in %
  minLength: 17, // min SL length in % of image width
  minGradient: 100, // 44 is the limit theoretically, min amount of gradients in SL
  maxSLDist: 1.5, // max scanline distance in %
  maxLengthDiff: 2, // max SL length difference in %
  maxSLDiffX: 2, // max difference of start point X of SL in %
  minSLNumber: parseInt(25 * SLA_STEPS, 10) };

// receive trigger from program
// initiate the localization algorithm
self.onmessage = function (e) {
  if (e.data.imgData) {

    // ---------------
    // LOCALIZATION
    // ---------------
    // convert to grayscale image
    var grayscaleRes = Img.convertToGrayscale(e.data.imgData);

    // use gradient operator
    var gradientRes = Img.gradientAndBinarize(grayscaleRes.imgData, GRAD_SOBEL_X);

    // start localization
    var PBCAs = [];
    PBCAs = SLA.localizationSLA(gradientRes.imgData, gradientRes.gradient, SLA_STEPS, SLA_PARAMS);
    gradientRes.imgData = null;
    gradientRes.gradient = null;
    gradientRes = null;

    // return biggest PBCA for localization comparison (Jaccard)
    var areaSize = 0;
    var result = [];
    for (var ba in PBCAs) {
      var pbca = PBCAs[ba];

      var area = Math.max(0, pbca.endX - pbca.startX) * Math.max(0, pbca.endY - pbca.startY);

      if (area > areaSize) {
        areaSize = area;
        result = [];
        result.push(pbca);
      }
    }
    // postMessage({ type:'localization', areas: result });

    // -----------
    // DECODING
    // -----------

    var EANs = [];
    var PBCAImgData = void 0;
    for (var p in PBCAs) {
      var EAN = 'false';
      var PBCA = PBCAs[p];

      // slicing imageArrayGray.array to PBCA size
      PBCAImgData = Img.getRect(grayscaleRes.imgData, PBCA.startX, PBCA.startY, PBCA.endX - PBCA.startX, PBCA.endY - PBCA.startY);

      // decoding for each scanline
      for (var s in SLs) {
        var idx = Math.floor(PBCAImgData.height * SLs[s]);
        var rowImgData = Img.getRow(PBCAImgData, idx);
        var sum = rowImgData.data.reduce(function (acc, val, idx) {
          return idx % 4 === 0 ? acc + val : acc;
        }, 0);

        // select grayscale scanline
        var sl = Img.binarize(rowImgData, sum / rowImgData.width);

        var row = new Uint8ClampedArray(rowImgData.width);
        sl.data.reduce(function (acc, val, idx) {
          if (idx % 4 === 0) {
            acc[idx / 4] = val;
          }
          return acc;
        }, row);
        // RLEncoding the scanline
        var rle = RLE.runLengthEncoding(row);
        var rows = RLE.sliceDigits(rle);

        for (var r in rows) {
          var digits = rows[r];

          if (digits.length === 12) {
            var normalization = RLE.normalizeDigits(digits);
            EAN = RLE.findSimilarNumbers(normalization);
            if (EAN !== 'false') {
              EANs.push(EAN);
              break;
            }
          } else {
            EAN = 'false';
          }
        }

        if (EAN !== 'false') {
          break;
        }
      } // end parsing all Scanlines SLs

      // if (EAN != "false") {
      //	break;
      // }
    } // end parsing all PBCAs

    // ---------
    // RESULTS
    // ---------

    grayscaleRes.imgData = null;
    PBCAs = null;
    PBCAImgData = null;
    result = null;

    postMessage({ type: 'decoding', id: e.data.id, payload: { EAN: EANs } });
  } else {
    postMessage({ type: 'decoding', id: e.data.id, payload: { EAN: [] } });
  }
};

// signal that the worker is ready
postMessage({ type: 'status', payload: { status: 'ready' } });

/***/ })
/******/ ]);
//# sourceMappingURL=0a9cf70fe41961fcad13.worker.js.map