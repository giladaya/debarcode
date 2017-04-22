// SLA localization functions

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['b'], function (b) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.SLA = factory(b));
        });
    } else {
        // Browser globals
        root.SLA = factory(root.b);
    }
}(this, function (b) {
    //use b in some fashion.

    function getPixelComponent(imageData, x, y, colorIdx) {
        return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
    }

    function findScanlines(array, SLASteps, SlaParams) {
        // width/height of the image data
        var w = array[0].length;
        var h = array.length;
        //var max = Math.max(array.length, array[0].length);
        var max = w;    // take width because of horizontal barcodes

        // set parameters depending on image dimensions
        var steps = Math.floor(h / (h * SLASteps));
        var MaxDist = (max * SlaParams.maxDist) / 100;
        var MinLength = (max * SlaParams.minLength) / 100;

        // store result for scanline
        var resultSLs = [];

        for (var row = 0; row < array.length; row += steps) {

            for (var pixel = 0; pixel < (array[row].length - MinLength) ; pixel++) {

                // test if gradient pixel
                if (array[row][pixel][0] == 255) {
                    var pxl = array[row][pixel];
                    var angle = pxl[4];
                    var angleSum = pxl[4];
                    var scanlineLength = 0, foundSomething = 1, nothingFound = 0;
                    var scanline = { x: null, y: null, scanlineLength: 0, angleAVG: null };

                    for (var i = pixel + 1; i < w; i++) {   // loop 1
                        scanlineLength++;

                        // test if gradient and increase counter if similar
                        var oth = array[row][i];
                        if (oth[0] == 255 && ((oth[4] >= pxl[4] - SlaParams.angleDiff) && (oth[4] <= pxl[4] + SlaParams.angleDiff))) {
                            foundSomething++;
                            angleSum += oth[4];
                            nothingFound = 0;
                        } else {
                            nothingFound++;
                        }

                        // test for thresholds
                        // if exceeds maxDistance or is last pixel of row
                        if (nothingFound > MaxDist || i == (w - 1)) {
                            if (foundSomething >= SlaParams.minGradient) {
                                scanline = { x: pixel, y: row, scanlineLength: (scanlineLength - nothingFound), angleAVG: parseInt(angleSum / foundSomething) };
                            }
                            break;
                        }
                    }   // end loop 1

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

    function findPBCAfromSLs(scanlines, SlaParams) {
        var PBCAs = [];

        //var max = Math.max(imageData.height, imageData.width);
        var max = imageData.width;  // take width because of horizontal barcodes

        var MaxSLDist = (max * SlaParams.maxSLDist) / 100;
        var MaxLengthDiff = (max * SlaParams.maxLengthDiff) / 100;
        var MaxSLDiffX = (max * SlaParams.maxSLDiffX) / 100;

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

            for (var j = (i + 1) ; j < scanlines.length; j++) {
                var nSL = scanlines[j];

                // test if SL is within range
                if (nSL.y <= refPointY + MaxSLDist) {

                    // test if angle is similar and length is similar to previous
                    if ((nSL.y != refPointY) && // Y coordinate different ?
                        (nSL.x >= refPointX - MaxSLDiffX) &&
                        (nSL.x <= refPointX + MaxSLDiffX) &&
                        (nSL.angleAVG >= angle - SlaParams.angleDiff) &&
                        (nSL.angleAVG <= angle + SlaParams.angleDiff) &&
                        (nSL.scanlineLength >= length - MaxLengthDiff) &&
                        (nSL.scanlineLength <= length + MaxLengthDiff)) {

                        // put SL into PBCA
                        tempPBCA.push(nSL);
                        next = j;

                        // set adapted length and angle to compare with next line
                        length = nSL.scanlineLength;
                        angle = nSL.angleAVG;
                        refPointX = nSL.x;
                        refPointY = nSL.y;

                    }
                } else { // break because they are sorted by Y and following will be out of range
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

    function localizationSLA(array, SLASteps, SlaParams) {
        // calulate border aroung barcode image
        //var max = Math.max(imageData.height, imageData.width);
        var max = imageData.width;  // take width because of horizontal barcodes
        var borderX = Math.floor((max * locBorder) / 100);
        var borderY = 0;//(max * locBorder) / 100;

        // find scanlines that fit into requirements
        var scanlines = findScanlines(array, SLASteps, SlaParams);

        // mark scanlines
        if (debug) {
            for (s in scanlines) {
                var sl = scanlines[s];
                for (var x = sl.x; x <= (sl.x + sl.scanlineLength) ; x++) {
                    array[sl.y][x][0] = 255;
                    array[sl.y][x][1] = 0;
                    array[sl.y][x][2] = 0;
                }
            }
            postMessage({ localization: true, print: arrayToImageData(imageData, array) });
        }


        // compare scanlines
        var areas = findPBCAfromSLs(scanlines, SlaParams);

        // edit areas for returning results
        var areaSize = 0;
        var result = [];
        for (ba in areas) {
            var area = areas[ba];
            var startX = [], endX = [], Y = [];

            for (s in area) {
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

        // mark PBCAs in Image, only debug
        if (debug) {
            for (ba in result) {
                var pbca = result[ba];

                // colorize pixels
                for (var y = pbca.startY; y <= pbca.endY; y++) {
                    for (var x = pbca.startX; x <= pbca.endX; x++) {
                        array[y][x][1] = 255;
                        array[y][x][2] = 0;
                    }
                }
            }
            postMessage({ localization: true, print: arrayToImageData(imageData, array) });
        }

        return result;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        findScanlines,
        findPBCAfromSLs,
        localizationSLA,
    };
}));