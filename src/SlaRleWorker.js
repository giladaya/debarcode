/* --------------------------------------------------

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

import * as Img from './Img';
import * as RLE from './RLE';
import * as SLA from './SLA';

// self.importScripts('Img.js', 'SLA.js', 'RLE.js');

const debug = false;

const locBorder = 0;// 3;	// additional border for located barcode in %

const SLs = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9];

// Sobel gradient operator
const GRAD_SOBEL_X = [
  -1, 0, 1,
  -2, 0, 2,
  -1, 0, 1
];
const GRAD_SOBEL_Y = [
  -1, -2, -1,
  0, 0, 0,
  1, 2, 1
];

// SLA algorithm parameters
// limits and performance optimizations for scanlines
const SLA_STEPS = 1 / 3;	// steps to jump over image rows, shows the amount of rows that will be parsed in %
// const SLA_LIMIT_X = 20;
// const SLA_LIMIT_Y = 20;

// parameters
const SLA_PARAMS = {
  locBorder,
  angleDiff: 11,	// difference of angles for gradients and SLs
  maxDist: 1.7, // 3, // min gradient distance in %
  minLength: 17, // min SL length in % of image width
  minGradient: 100, // 44 is the limit theoretically, min amount of gradients in SL
  maxSLDist: 1.5, // max scanline distance in %
  maxLengthDiff: 2, // max SL length difference in %
  maxSLDiffX: 2, // max difference of start point X of SL in %
  minSLNumber: parseInt(25 * SLA_STEPS, 10), // min number of SLs for PBCA
}

// receive trigger from program
// initiate the localization algorithm
self.onmessage = function (e) {
  if (e.data.imgData) {

		// ---------------
		// LOCALIZATION
		// ---------------
		// convert to grayscale image
    let grayscaleRes = Img.convertToGrayscale(e.data.imgData);

		// use gradient operator
    let gradientRes = Img.gradientAndBinarize(grayscaleRes.imgData, GRAD_SOBEL_X);

		// start localization
    var PBCAs = [];
    PBCAs = SLA.localizationSLA(gradientRes.imgData, gradientRes.gradient, SLA_STEPS, SLA_PARAMS);
    gradientRes.imgData = null;
    gradientRes.gradient = null;
    gradientRes = null;

		// return biggest PBCA for localization comparison (Jaccard)
    var areaSize = 0;
    var result = [];
    for (let ba in PBCAs) {
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

    const EANs = [];
    let PBCAImgData;
    for (let p in PBCAs) {
      let EAN = 'false';
      var PBCA = PBCAs[p];

			// slicing imageArrayGray.array to PBCA size
      PBCAImgData = Img.getRect(
				grayscaleRes.imgData,
				PBCA.startX,
				PBCA.startY,
				(PBCA.endX - PBCA.startX),
				(PBCA.endY - PBCA.startY)
			)

			// decoding for each scanline
      for (let s in SLs) {
        const idx = Math.floor(PBCAImgData.height * SLs[s]);
        const rowImgData = Img.getRow(PBCAImgData, idx)
        const sum = rowImgData.data.reduce(function (acc, val, idx) { return (idx % 4 === 0) ? acc + val : acc}, 0);

				// select grayscale scanline
        const sl = Img.binarize(rowImgData, (sum / rowImgData.width));

        const row = new Uint8ClampedArray(rowImgData.width)
        sl.data.reduce(
          function (acc, val, idx) {
            if (idx % 4 === 0) {
              acc[idx / 4] = val;
            }
            return acc;
          },
          row
        )
        // RLEncoding the scanline
        const rle = RLE.runLengthEncoding(row);
        const rows = RLE.sliceDigits(rle);

        for (let r in rows) {
          const digits = rows[r];

          if (digits.length === 12) {
            const normalization = RLE.normalizeDigits(digits);
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

      }	// end parsing all Scanlines SLs

			// if (EAN != "false") {
			//	break;
			// }

    }	// end parsing all PBCAs

		// ---------
		// RESULTS
		// ---------

    grayscaleRes.imgData = null;
    PBCAs = null;
    PBCAImgData = null;
    result = null;

    postMessage({ type: 'decoding', id: e.data.id, payload: {EAN: EANs} });
  } else {
    postMessage({ type: 'decoding', id: e.data.id, payload: {EAN: []} });
  }
};

// signal that the worker is ready
postMessage({ type: 'status', payload: {status: 'ready'} });
