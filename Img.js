// image preprocessing functions

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['b'], function (b) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.Img = factory(b));
        });
    } else {
        // Browser globals
        root.Img = factory(root.b);
    }
}(this, function (b) {
    //use b in some fashion.

    function getPixelComponent(imageData, x, y, colorIdx) {
        return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
    }

    function convertToGrayscale(array) {
        // width/height of the image data
        var w = array[0].length;
        var h = array.length;
        var graySum = 0;

        for (row in array) {
            for (pixel in array[row]) {
                // gray = 0.299*r + 0.587*g + 0.114*b
                gray = parseInt((0.299 * array[row][pixel][0]) + (0.587 * array[row][pixel][1]) + (0.114 * array[row][pixel][2]));
                array[row][pixel][0] = array[row][pixel][1] = array[row][pixel][2] = gray;
                graySum += gray;
            }
        }

        return { array: array, threshold: (graySum / (w * h)) };
    }

    function gradientSimple(array, operator) {
        // parameters of operator
        var side = Math.round(Math.sqrt(operator.length));
        var halfSide = Math.floor(side / 2);
        // width/height of the image data
        var w = array[0].length;
        var h = array.length;
        // destination array for output and temporary arrays for filling
        var dst = [];
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
                var gradX = Math.abs(array[y][xRight][0] - array[y][xLeft][0]);
                var gradY = Math.abs(array[yDown][x][0] - array[yUp][x][0]);
                var gradient = parseInt((gradX + gradY) / 2);
                gradSum += gradient;

                // calculate angles
                //var angle = parseInt((Math.atan(gradY / gradX) * 180) / Math.PI);
                var angle = parseInt(((gradX == 0 ? 0 : Math.atan(gradY / gradX)) * 180) / Math.PI);
                var q = (gradX >= 0 && gradY >= 0) ? 1 : -1;

                // set gradient value for destination pixel
                gradient = Math.abs(gradient);
                tempLine.push([gradient, gradient, gradient, 255, angle, q]);
            }
            dst.push(tempLine);
        }

        return { result: dst, threshold: (gradSum / (w * h)) };
    }

    function binarize(array, threshold) {
        // width/height of the image data
        var w = array[0].length;
        var h = array.length;

        // parse through all pixels
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var value = (array[y][x][0] >= threshold) ? 255 : 0;
                array[y][x][0] = array[y][x][1] = array[y][x][2] = value;
            }
        }

        return array;
    }

    function gradientAndBinarize(array, gradSobelX) {
        var tempArray;

        // simple gradient
        var gradient = gradientSimple(array, gradSobelX);
        tempArray = binarize(gradient.result, gradient.threshold);

        return tempArray;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        log: function(msg) { console.log(msg) },
        convertToGrayscale,
        gradientSimple,
        binarize,
        gradientAndBinarize,
    };
}));