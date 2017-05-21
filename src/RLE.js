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
    previous = current
  }

  if (n > 0) {
    result.push({ val: previous, len: n });
  }

  const length = result.length;
  const start = result[0].val === 255 ? 1 : 0;
  const end = result[length - 1].val === 255 ? (length - 1) : length;

  return result.slice(start, end);
}

function sliceDigits(rle) {
  const units = 59;
  var result = [];
  var digits = [];
  const dsize = 4;  // bars per digit (2 black, 2 white)
  const outer = 3;  // outer guards (black, white, black)
  const inner = 5;  // inner guard (white, black, white, black, white)

  var m, i;

  // test, if units is bigger than
  if (rle.length >= units) {
    const possibilites = rle.length - units + 1;

    for (m = 0; m < possibilites; m++) {
      digits = [];

      for (i = 0; i < 6; i++) {
        const pos = m + outer + (i * dsize);
        const digit = rle.slice(pos, pos + dsize);

        digits.push(digit);
      }

      for (i = 6; i < 12; i++) {
        const pos = m + outer + inner + (i * dsize);
        const digit = rle.slice(pos, pos + dsize);

        digits.push(digit);
      }

      result.push(digits);
    }

  }

  return result;
}

function normalizeDigits(digits) {
  var normalization = [];
  var sum;

  for (let d in digits) {
    let digit = digits[d];
    sum = 0;

    for (let m in digit) {
      const module = digit[m];
      sum += module.len;
    }

    let row = [];

    for (let m in digit) {
      row.push(digit[m].len / sum);
    }
    normalization.push(row);
  }
  return normalization;
}

function mod(a, n) {
  return ((a % n) + n) % n;
}

function findSimilarNumbers(normalization) {
  /* eslint-disable max-len */
  var defaults = {
    leftDigitsOdd: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
    leftDigitsEven: [[1, 1, 2, 3], [1, 2, 2, 2], [2, 2, 1, 2], [1, 1, 4, 1], [2, 3, 1, 1], [1, 3, 2, 1], [4, 1, 1, 1], [2, 1, 3, 1], [3, 1, 2, 1], [2, 1, 1, 3]],
    rightDigits: [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]],
    parity: ['OOOOOO', 'OOEOEE', 'OOEEOE', 'OOEEEO', 'OEOOEE', 'OEEOOE', 'OEEEOO', 'OEOEOE', 'OEOEEO', 'OEEOEO']
  }
  /* eslint-enable max-len */

  var sum;
  var i, j;

  // convert EAN tables
  for (i in defaults.leftDigitsOdd) {
    const digit = defaults.leftDigitsOdd[i];
    sum = 0;

    for (let m in digit) {
      sum += digit[m];
    }

    for (let m in digit) {
      digit[m] = digit[m] / sum;
    }
  }

  for (i in defaults.leftDigitsEven) {
    const digit = defaults.leftDigitsEven[i];
    sum = 0;

    for (let m in digit) {
      sum += digit[m];
    }

    for (let m in digit) {
      digit[m] = digit[m] / sum;
    }
  }

  for (i in defaults.rightDigits) {
    const digit = defaults.rightDigits[i];
    sum = 0;

    for (let m in digit) {
      sum += digit[m];
    }

    for (let m in digit) {
      digit[m] = digit[m] / sum;
    }
  }

  // check for similarity
  const result = [];
  // left digits
  var difference;

  for (i = 0; i < 6; i++) {
    const digit = normalization[i];
    let digitSim = [];

    for (let o in defaults.leftDigitsOdd) {
      const template = defaults.leftDigitsOdd[o];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(template[j] - digit[j]);
      }
      digitSim.push(difference);
    }
    result.push({ odd: digitSim, even: 0 });

    digitSim = [];
    for (let o in defaults.leftDigitsEven) {
      const template = defaults.leftDigitsEven[o];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(template[j] - digit[j]);
      }
      digitSim.push(difference);
    }
    result[i].even = digitSim;
  }

  // right digits
  for (i = 6; i < 12; i++) {
    const digit = normalization[i];
    let digitSim = [];

    for (let o in defaults.rightDigits) {
      const template = defaults.rightDigits[o];
      difference = 0;

      for (j = 0; j < 4; j++) {
        difference += Math.abs(template[j] - digit[j]);
      }
      digitSim.push(difference);
    }
    result.push({ odd: 0, even: digitSim });
  }

  var parity = '';
  var EAN = '';

  for (let r in result) {
    const digit = result[r];
    let number = 0;

    if (r < 6) {
      const oddMin = Math.min.apply(Math, digit.odd);
      const odd = digit.odd.indexOf(oddMin);

      const evenMin = Math.min.apply(Math, digit.even);
      const even = digit.even.indexOf(evenMin);

      if (oddMin < evenMin) {
        number = odd;
        parity += 'O';
      } else {
        number = even;
        parity += 'E';
      }
    } else {
      number = digit.even.indexOf(Math.min.apply(Math, digit.even));
    }

    EAN += number.toString();
  }

  // calculate first digit from parity!!!
  const firstDigit = defaults.parity.indexOf(parity).toString();
  if (parseInt(firstDigit, 10) < 0) {
    EAN = 'false';
  } else {
    EAN = firstDigit + EAN;

    var checksum = 0;
    for (i = 0; i < 12; i++) {
      checksum += EAN[i] * (mod(i + 1, 2) ? 1 : 3);
    }

    if (!mod((10 - mod(checksum, 10)), 10) === parseInt(EAN[12], 10)) {
      EAN = 'false';
    }
  }

  return EAN;
}

module.exports = {
  runLengthEncoding,
  sliceDigits,
  normalizeDigits,
  findSimilarNumbers,
};
