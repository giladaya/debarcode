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
    function putPixel(imageData, x, y, r, g, b, a) {
        a = a || 255;
        imageData.data[(y * imageData.width + x) * 4 + 0] = r;
        imageData.data[(y * imageData.width + x) * 4 + 1] = g;
        imageData.data[(y * imageData.width + x) * 4 + 2] = b;
        imageData.data[(y * imageData.width + x) * 4 + 3] = a;
    }
    function getRect(imageData, x, y, width, height) {
        let data = new Uint8ClampedArray(width * height * 4);
        for (let row = y; row < y + height; row++ ) {
            const begin = (row * imageData.width + x) * 4;
            const end = begin + (width * 4);
            const dataRow = imageData.data.slice(begin, end)
            const offset = (row - y) * width * 4;
            data.set(dataRow, offset);
        }
        return new ImageData(data, width, height);
    }
    function getRow(imageData, y) {
        const begin = y * imageData.width * 4;
        const end = begin + imageData.width * 4;
        const data = imageData.data.slice(begin, end);
        return new ImageData(data, imageData.width, 1);
    }

    function _convertToGrayscale(array) {
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

    /*
     * @param imgData: ImageData
     */
    function convertToGrayscale(imgData) {
        const w = imgData.width;
        const h = imgData.height;
        let graySum = 0;
        const newImgData = new ImageData(imgData.width, imgData.height);

        for (let row = 0; row < h; row++ ) {
            for (let col = 0; col < w; col++ ) {
                // gray = 0.299*r + 0.587*g + 0.114*b
                const red = getPixelComponent(imgData, col, row, 0),
                    green = getPixelComponent(imgData, col, row, 1),
                    blue = getPixelComponent(imgData, col, row, 2);
                const gray = parseInt((0.299 * red) + (0.587 * green) + (0.114 * blue));
                putPixel(newImgData, col, row, gray, gray, gray);
                graySum += gray;
            }
        }

        // return { array: array, threshold: (graySum / (w * h)) };
        return {imgData: newImgData, threshold: (graySum / (w * h)) };
    }

    function _gradientSimple(array, operator) {
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

    function gradientSimple(imgData, operator) {
        // parameters of operator
        const side = Math.round(Math.sqrt(operator.length));
        const halfSide = Math.floor(side / 2);
        // width/height of the image data
        const w = imgData.width;
        const h = imgData.height;
        // destination array for output and temporary arrays for filling
        let dst = [];
        const newImgData = new ImageData(imgData.width, imgData.height);

        let tempLine = [];
        // gradient sum
        let gradSum = 0;

        // parse through all pixels
        for (let y = 0; y < h; y++) {
            tempLine = [];

            for (let x = 0; x < w; x++) {
                // calculate neighbor pixels, escape out of bounds indexes
                const xLeft = Math.max(0, x - 1);
                const xRight = Math.min(w - 1, x + 1);
                const yUp = Math.max(0, y - 1);
                const yDown = Math.min(h - 1, y + 1);

                // simple gradient (equation 19, page 49)
                const vr = getPixelComponent(imgData, xRight, y, 0),
                    vl = getPixelComponent(imgData, xLeft, y, 0),
                    vd = getPixelComponent(imgData, x, yDown, 0),
                    vu = getPixelComponent(imgData, x, yUp, 0);
                const gradX = Math.abs(vr - vl);
                const gradY = Math.abs(vd - vu);
                let gradient = parseInt((gradX + gradY) / 2);
                gradSum += gradient;

                // calculate angles
                //let angle = parseInt((Math.atan(gradY / gradX) * 180) / Math.PI);
                let angle = parseInt(((gradX == 0 ? 0 : Math.atan(gradY / gradX)) * 180) / Math.PI);
                let q = (gradX >= 0 && gradY >= 0) ? 1 : -1;

                // set gradient value for destination pixel
                gradient = Math.abs(gradient);
                putPixel(newImgData, x, y, gradient, gradient, gradient);

                tempLine.push([angle, q]);
            }
            dst.push(tempLine);
        }

        return { imgData: newImgData, gradient: dst, threshold: (gradSum / (w * h)) };
    }

    function _binarize(array, threshold) {
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

    /*
     * @param imgData: ImageData
     */
    function binarize(imgData, threshold) {
        const w = imgData.width;
        const h = imgData.height;
        const newImgData = new ImageData(imgData.data, imgData.width, imgData.height);

        for (let row = 0; row < h; row++ ) {
            for (let col = 0; col < w; col++ ) {
                // gray = 0.299*r + 0.587*g + 0.114*b
                const red = getPixelComponent(imgData, col, row, 0);
                const value = (red >= threshold) ? 255 : 0;
                putPixel(newImgData, col, row, value, value, value);
            }
        }

        return newImgData;
    }

    function _gradientAndBinarize(array, gradSobelX) {
        var tempArray;

        // simple gradient
        var gradient = gradientSimple(array, gradSobelX);
        tempArray = binarize(gradient.result, gradient.threshold);

        return tempArray;
    }

    function gradientAndBinarize(imgData, gradSobelX) {
        const gradientResult = gradientSimple(imgData, gradSobelX);
        const binImgData = binarize(gradientResult.imgData, gradientResult.threshold);

        // image data was transformed, 
        // return meta gradient info
        return {imgData: binImgData, gradient: gradientResult.gradient};
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        getRect,
        getRow,
        convertToGrayscale,
        gradientSimple,
        binarize,
        gradientAndBinarize,
    };
}));