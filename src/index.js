// Web Worker
// let url = new URL("../../src/SlaRleWorker.js", window.location);
// var SlaRleWorker = new Worker(url.toString());
var SlaRleWorker = require('worker-loader?inline!./SlaRleWorker');

const worker = new SlaRleWorker();

var msgId = 0;
var decodeCbs = {};
var onInit = function (err) {
  console.log(err);
}

function handleDecodeResult(id, payload) {
  if (!decodeCbs[id]) {
    return;
  }

  // create result object
  const res = {
    reqId: id,
    codes: []
  }

  if (payload.EAN && payload.EAN.length > 0) {
    res.codes = payload.EAN.map(function (code, idx) {
      return {
        value: code,
        format: 'EAN',
      }
    })
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
  console.log('received', e.data.type)

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
  const id = msgId++;

  var message = {
    id: id,
    imgData: imgData,
  };

  decodeCbs[id] = cb;
  worker.postMessage(message);
  message = null;
  return id;
}

export default {
  init: init,
  decode: decode,
}
