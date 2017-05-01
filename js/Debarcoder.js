(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return (root.Debarcoder = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require());
    } else {
        // Browser globals
        root.Debarcoder = factory();
    }
}(this, function(){
  // Web Worker
  var SlaRleWorker = new Worker('js/SlaRleWorker.js');
  var msgId = 0;
  var decodeCbs = {};
  var onInit = function(err) {}

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
      res.codes = payload.EAN.map(function(code, idx) {
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
    SlaRleWorker.onmessage = handleWwMessage;
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
    SlaRleWorker.postMessage(message);
    message = null;
    return id;
  }

  return {
    init: init,
    decode: decode,
  }
}));
