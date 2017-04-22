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

self.importScripts('Img.js', 'SLA.js', 'RLE.js');

const debug = false;

const locBorder = 0;//3;	// additional border for located barcode in %

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
const SLA_STEPS = 1/3;	// steps to jump over image rows, shows the amount of rows that will be parsed in %
// const SLA_LIMIT_X = 20;
// const SLA_LIMIT_Y = 20;

// parameters
const SLA_PARAMS = {
	angleDiff: 11,	// difference of angles for gradients and SLs
	maxDist: 1.7, // 3, // min gradient distance in %
	minLength: 17, // min SL length in % of image width
	minGradient: 100, // 44 is the limit theoretically, min amount of gradients in SL
	maxSLDist: 1.5, // max scanline distance in %
	maxLengthDiff: 2, // max SL length difference in %
	maxSLDiffX: 2, // max difference of start point X of SL in %
	minSLNumber: parseInt(25 * SLA_STEPS), // min number of SLs for PBCA	
}

// ### standard functions #######################################################################
// http://javascript.about.com/od/problemsolving/a/modulobug.htm
Number.prototype.mod = function (n) {
	return ((this % n) + n) % n;
}


// transform array back to image data
function arrayToImageData(img, array) {
	for (row in array) {
		for (pixel in array[row]) {
			p = (parseInt(row) * img.width + parseInt(pixel)) * 4;
			img.data[p + 0] = array[row][pixel][0];
			img.data[p + 1] = array[row][pixel][1];
			img.data[p + 2] = array[row][pixel][2];
			img.data[p + 3] = array[row][pixel][3];
		}
	}
	return img;
}


// transform imageData.data to array [row][pixel][rgba]
function createArray(img) {
	var tempArray = [];
	var tempLine = [];
	for (var i = 0; i < img.height; i += 1) {
		tempLine = [];
		for (var j = 0; j < img.width; j += 1) {
			p = (i * img.width + j) * 4;
			tempLine.push([img.data[p], img.data[p + 1], img.data[p + 2], img.data[p + 3]]);
		}
		tempArray.push(tempLine);
	}
	return tempArray;
}
// ### standard functions #######################################################################



// receive trigger from program
// initiate the localization algorithm
self.onmessage = function (e) {
	if (e.data.img) {
		// create a new imageData object from the given parameters
		imageData = {
			data: new Uint8ClampedArray(e.data.img),
			width: e.data.width,
			height: e.data.height
		};


		// LOCALIZATION #########################################################################

		// convert imageData to array
		imageArray = createArray(imageData);	// create two-dimensional array from imageData

		// convert to grayscale image
		imageArrayGray = Img.convertToGrayscale(imageArray);
		if (debug) postMessage({ localization: true, print: arrayToImageData(imageData, imageArrayGray.array) });
		else imageData.data = null;
		imageArray = null;

		// use gradient operator
		imageArrayBin = Img.gradientAndBinarize(imageArrayGray.array, GRAD_SOBEL_X);
		if (debug) postMessage({ localization: true, print: arrayToImageData(imageData, imageArrayBin) });
		else imageData.data = null;
		//imageArrayGray = null;

		// start localization
		var PBCAs = [];
		PBCAs = SLA.localizationSLA(imageArrayBin, SLA_STEPS, SLA_PARAMS);
		imageArrayBin = null;

		// return biggest PBCA for localization comparison (Jaccard)
		var areaSize = 0;
		var result = [];
		for (ba in PBCAs) {
			var pbca = PBCAs[ba];

			var area = Math.max(0, pbca.endX - pbca.startX) * Math.max(0, pbca.endY - pbca.startY);

			if (area > areaSize) {
				areaSize = area;
				result = [];
				result.push(pbca);
			}
		}
		postMessage({ localization: true, name: "Stern (2011)", result: true, areas: result });
		

		// DECODING #########################################################################

		EANs = [];
		for (p in PBCAs) {
			EAN = "false";
			var PBCA = PBCAs[p];

			// slicing imageArrayGray.array to PBCA size
			var PBCAimg = [];
			for (i = PBCA.startY; i <= PBCA.endY; i++) {
				PBCAimg.push(imageArrayGray.array[i].slice(PBCA.startX, (PBCA.endX + 1)));
			}

			// decoding for each scanline
			for (s in SLs) {

				var row = PBCAimg[Math.floor(PBCAimg.length * SLs[s])];
				var sum = 0;
				for (r in row) {
					var pxl = row[r];
					sum += pxl[0];
				}

				// select grayscale scanline				
				sl = Img.binarize([row], (sum / row.length));
				//if (debug) postMessage({ localization: true, print: arrayToImageData(imageData, sl) });

				// RLEncoding the scanline
				rle = RLE.runLengthEncoding(sl[0]);
				rows = RLE.sliceDigits(rle);

				for (r in rows) {
					digits = rows[r];

					if (digits.length == 12) {
						normalization = RLE.normalizeDigits(digits);
						EAN = RLE.findSimilarNumbers(normalization);
						if (EAN != "false") {
							EANs.push(EAN);
							break;
						}
					} else {
						EAN = "false";
					}
				}

				if (EAN != "false") {
					break;
				}

			}	// end parsing all Scanlines SLs

			//if (EAN != "false") {
			//	break;
			//}

		}	// end parsing all PBCAs


		// RESULTS #########################################################################
		//imageData = arrayToImageData(imageData, imageArrayBin);

		imageData = null;
		imageArray = null;
		imageArrayGray = null;
		imageArrayBin = null;
		PBCAs = null;
		result = null;


		postMessage({ decoding: true, name: "Stern (2011)", result: true, EAN: EANs });
	} else {
		postMessage({ decoding: false });
	}
};