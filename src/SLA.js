// SLA localization functions

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.SLA = factory(b));
        });
    } else {
        // Browser globals
        root.SLA = factory(root.b);
    }
}(this, function () {

    function getPixelComponent(imageData, x, y, colorIdx) {
        return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
    }

    function findScanlines(imgData, gradient, SLASteps, SlaParams) {
        // width/height of the image data
        const w = imgData.width;
        const h = imgData.height;
        //var max = Math.max(array.length, array[0].length);
        const max = w;    // take width because of horizontal barcodes

        // set parameters depending on image dimensions
        const steps = Math.floor(h / (h * SLASteps));
        const MaxDist = (max * SlaParams.maxDist) / 100;
        const MinLength = (max * SlaParams.minLength) / 100;

        // store result for scanline
        let resultSLs = [];

        for (var row = 0; row < h; row += steps) {

            for (var pixel = 0; pixel < (w - MinLength); pixel++) {

                // test if gradient pixel
                if (getPixelComponent(imgData, pixel, row, 0) == 255) {
                    const angle = gradient[row][pixel][0];
                    let angleSum = angle;
                    var scanlineLength = 0, foundSomething = 1, nothingFound = 0;
                    let scanline = { x: null, y: null, scanlineLength: 0, angleAVG: null };

                    for (let i = pixel + 1; i < w; i++) {   // loop 1
                        scanlineLength++;

                        // test if gradient and increase counter if similar
                        var othPixelValue = getPixelComponent(imgData, i, row, 0)
                        const othAngle = gradient[row][i][0];
                        if (othPixelValue == 255 && ((othAngle >= angle - SlaParams.angleDiff) && (othAngle <= angle + SlaParams.angleDiff))) {
                            foundSomething++;
                            angleSum = angleSum + othAngle;
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

    function findPBCAfromSLs(width, scanlines, SlaParams) {
        var PBCAs = [];

        //var max = Math.max(imageData.height, imageData.width);
        var max = width;  // take width because of horizontal barcodes

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

    /**
     * @param imgData: ImageData
     * @param gradient: Array of [angle, q]
     * @param SLASteps: number
     * @param SlaParams: object
     */
    function localizationSLA(imgData, gradient, SLASteps, SlaParams) {
        // calulate border aroung barcode image
        //var max = Math.max(imageData.height, imageData.width);
        var max = imgData.width;  // take width because of horizontal barcodes
        var borderX = Math.floor((max * locBorder) / 100);
        var borderY = 0;//(max * locBorder) / 100;

        // find scanlines that fit into requirements
        var scanlines = findScanlines(imgData, gradient, SLASteps, SlaParams);

        // compare scanlines
        var areas = findPBCAfromSLs(imgData.width, scanlines, SlaParams);

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