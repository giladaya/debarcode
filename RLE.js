// RLE decoding functions

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['b'], function (b) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.RLE = factory(b));
        });
    } else {
        // Browser globals
        root.RLE = factory(root.b);
    }
}(this, function (b) {
    //use b in some fashion.

    function getPixelComponent(imageData, x, y, colorIdx) {
        return imageData.data[(y * imageData.width + x) * 4 + colorIdx];
    }

    function _runLengthEncoding(row) {
        var w = row.length;
        var result = [];
        var previous = null;
        var n = 0;

        for (var x = 0; x < w; x++) {
            current = row[x][0];

            if (current != previous && previous != null) {
                result.push({ val: previous, len: n });
                n = 0;
            }
            n++;
            previous = current
        }

        if (n > 0) {
            result.push({ val: previous, len: n });
        }

        length = result.length;
        start = result[0].val == 255 ? 1 : 0;
        end = result[length - 1].val == 255 ? (length - 1) : length;

        return result.slice(start, end);
    }
    function runLengthEncoding(row) {
        var w = row.length;
        var result = [];
        var previous = null;
        var n = 0;

        for (var x = 0; x < w; x++) {
            current = row[x];

            if (current != previous && previous != null) {
                result.push({ val: previous, len: n });
                n = 0;
            }
            n++;
            previous = current
        }

        if (n > 0) {
            result.push({ val: previous, len: n });
        }

        length = result.length;
        start = result[0].val == 255 ? 1 : 0;
        end = result[length - 1].val == 255 ? (length - 1) : length;

        return result.slice(start, end);
    }

    function sliceDigits(rle) {
        var units = 59;
        var result = [];
        var digits = [];
        var dsize = 4;  // bars per digit (2 black, 2 white)
        var outer = 3;  // outer guards (black, white, black)
        var inner = 5;  // inner guard (white, black, white, black, white)

        // test, if units is bigger than
        if (rle.length >= units) {
            var possibilites = rle.length - units + 1;
            for (m = 0; m < possibilites; m++) {
                digits = [];

                for (i = 0; i < 6; i++) {
                    pos = m + outer + (i * dsize);
                    digit = rle.slice(pos, pos + dsize);
                    digits.push(digit);
                }

                for (i = 6; i < 12; i++) {
                    pos = m + outer + inner + (i * dsize);
                    digit = rle.slice(pos, pos + dsize);
                    digits.push(digit);
                }

                result.push(digits);
            }

        }

        return result;
    }

    function normalizeDigits(digits) {
        var normalization = [];
        for (d in digits) {
            digit = digits[d];
            var sum = 0;

            for (m in digit) {
                module = digit[m];
                sum += module.len;
            }

            var row = [];
            for (m in digit) {
                row.push(digit[m].len / sum);
            }
            normalization.push(row);
        }
        return normalization;
    }

    function mod (a, n) {
        return ((a % n) + n) % n;
    }

    function findSimilarNumbers(normalization) {
        var defaults = {
            leftDigitsOdd: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
            leftDigitsEven: [[1, 1, 2, 3], [1, 2, 2, 2], [2, 2, 1, 2], [1, 1, 4, 1], [2, 3, 1, 1], [1, 3, 2, 1], [4, 1, 1, 1], [2, 1, 3, 1], [3, 1, 2, 1], [2, 1, 1, 3]],
            rightDigits: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
            parity: ["OOOOOO", "OOEOEE", "OOEEOE", "OOEEEO", "OEOOEE", "OEEOOE", "OEEEOO", "OEOEOE", "OEOEEO", "OEEOEO"]
        }

        // convert EAN tables
        for (i in defaults.leftDigitsOdd) {
            var digit = defaults.leftDigitsOdd[i];
            var sum = 0;

            for (m in digit) {
                sum += digit[m];
            }

            for (m in digit) {
                digit[m] = digit[m] / sum;
            }
        }
        for (i in defaults.leftDigitsEven) {
            var digit = defaults.leftDigitsEven[i];
            var sum = 0;

            for (m in digit) {
                sum += digit[m];
            }

            for (m in digit) {
                digit[m] = digit[m] / sum;
            }
        }
        for (i in defaults.rightDigits) {
            var digit = defaults.rightDigits[i];
            var sum = 0;

            for (m in digit) {
                sum += digit[m];
            }

            for (m in digit) {
                digit[m] = digit[m] / sum;
            }
        }


        // check for similarity
        var result = [];
        // left digits
        for (var i = 0; i < 6; i++) {
            var digit = normalization[i];
            var digitSim = [];

            for (o in defaults.leftDigitsOdd) {
                var template = defaults.leftDigitsOdd[o];
                var difference = 0;

                for (var j = 0; j < 4; j++) {
                    difference += Math.abs(template[j] - digit[j]);
                }
                digitSim.push(difference);
            }
            result.push({ odd: digitSim, even: 0 });

            digitSim = [];
            for (o in defaults.leftDigitsEven) {
                var template = defaults.leftDigitsEven[o];
                var difference = 0;

                for (var j = 0; j < 4; j++) {
                    difference += Math.abs(template[j] - digit[j]);
                }
                digitSim.push(difference);
            }
            result[i].even = digitSim;
        }

        // right digits
        for (var i = 6; i < 12; i++) {
            var digit = normalization[i];
            var digitSim = [];

            for (o in defaults.rightDigits) {
                var template = defaults.rightDigits[o];
                var difference = 0;

                for (var j = 0; j < 4; j++) {
                    difference += Math.abs(template[j] - digit[j]);
                }
                digitSim.push(difference);
            }
            result.push({ odd: 0, even: digitSim });
        }

        var parity = "";
        var EAN = "";
        for (r in result) {
            var digit = result[r];
            var number = 0;

            if (r < 6) {
                var oddMin = Math.min.apply(Math, digit.odd);
                var odd = digit.odd.indexOf(oddMin);

                var evenMin = Math.min.apply(Math, digit.even);
                var even = digit.even.indexOf(evenMin);

                if (oddMin < evenMin) {
                    number = odd;
                    parity += "O";
                } else {
                    number = even;
                    parity += "E";
                }
            } else {
                number = digit.even.indexOf(Math.min.apply(Math, digit.even));
            }

            EAN += number.toString();
        }

        // calculate first digit from parity!!!
        firstDigit = defaults.parity.indexOf(parity).toString();
        if (parseInt(firstDigit) < 0) {
            EAN = "false";
        } else {
            EAN = firstDigit + EAN;

            checksum = 0;
            for (i = 0; i < 12; i++) {
                checksum += EAN[i] * (mod(i + 1, 2) ? 1 : 3);
            }

            // if (!((10 - checksum.mod(10)).mod(10) == parseInt(EAN[12]))) {
            //     EAN = "false";
            // }
            if (!mod((10 - mod(checksum, 10)), 10) == parseInt(EAN[12])) {
                EAN = "false";
            }
        }

        return EAN;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        runLengthEncoding,
        sliceDigits,
        normalizeDigits,
        findSimilarNumbers,
    };
}));