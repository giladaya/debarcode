(function () {

const TimeKeeper = (function() {
  var startTime;

  return {
    start: function() {
      startTime = Date.now();
    },
    end: function() {
      return (Date.now() - startTime)
    }
  }
})()

const ASPECT_RATIO = 0.5

// Web Worker
var SlaRleWorker = new Worker('./js/SlaRle.js');

// refs
var $video = document.getElementById('camera');
var $workCanvas = document.getElementById('workCanvas');
var $resolution = document.getElementById('resolution');
var $time = document.getElementById('time');
var $result = document.getElementById('result');
var $btnScan = document.getElementById('scan');

var raf = null; //requestAnimationFrame handle
var found = false;
var wwReady = false;

// Inits
attachEvents();
initCamera($video, startApp);

//---------------
// Functions
//---------------

function attachEvents() {
  $resolution.onchange = function(ev) {
    var width = $resolution.value;
    initCanvasSize($workCanvas, width, $video.videoWidth, ASPECT_RATIO);
  }

  // scan initiated
  $btnScan.onclick = function() {
    found = false;
    if (raf === null) drawFrame(); //start drawing
    initResults();
    doScan();
  }

  SlaRleWorker.onmessage = handleWwMessage;
}

// var constraints = { 
//   video: { 
//     facingMode: ("environment") ,
//     width: 600, 
//     height: 800
//   } 
// };

function initCamera($video, cb) {
  // create constraints for back camera from devices list
  function getBackCamConstraints(devices) {
    devices = devices.filter(function(d) {
      return d.kind === 'videoinput';
    });
    var back = devices.find(function(d) {
      return d.label.toLowerCase().indexOf('back') !== -1;
    }) || (devices.length && devices[devices.length - 1]);
    var constraints = {video: true}
    if (back) {
      constraints.video = {deviceId: back.deviceId};
      // constraints.video = {mandatory: {deviceId: back.deviceId}};
    }
    return constraints;
  }

  // initialize back camera
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
      var constraints = getBackCamConstraints(devices);
      return navigator.mediaDevices.getUserMedia(constraints);
  })
  .then(function(mediaStream) {
    $video.srcObject = mediaStream;
    $video.onloadedmetadata = function(e) {
      $video.play();
      cb();
    };
  })
  .catch(function(err) { 
    alert(err.name);
    console.log(err.name + ": " + err.message); 
  }); // always check for errors at the end.
}

function startApp() {
  initResults();
  initCanvasSize($workCanvas, $resolution.value, Math.max($video.videoWidth, 600), ASPECT_RATIO);
  drawFrame();
  doScan();
}

function showResults(result, timeMs) {
  $time.innerText = (timeMs / 1000);
  $result.innerText = result;
}
function initResults() {
  showResults('...', 0);
}

function doScan() {
  TimeKeeper.start();
  var tempCanvasCtx = $workCanvas.getContext("2d");
  var imgData = tempCanvasCtx.getImageData(0, 0, $workCanvas.width, $workCanvas.height);

  // prepare message
  var message = {
    imgData: imgData,
  };
  
  console.log('send')
  SlaRleWorker.postMessage(message);
  message = null;
}

function drawFrame() {
  if (wwReady) {
    var ctx = $workCanvas.getContext("2d");
    drawVideo($video, $workCanvas, ctx);
    drawLine($workCanvas, ctx);
  }
  // keep the cycle going
  raf = requestAnimationFrame(drawFrame);
}

function drawVideo($video, $canvas, ctx) {
  var dw = $canvas.width,
    dh = $canvas.height,
    sw = $video.videoWidth,
    sh = Math.ceil(dh / dw * sw)
    sy = Math.floor(($video.videoHeight - sh) / 2);

  // ctx.drawImage(video, 0, 0);
  ctx.drawImage($video, 0, sy, sw, sh, 0, 0, dw, dh);
}

function drawLine($canvas, ctx) {
  var dw = $canvas.width,
    dh = $canvas.height
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)'
  ctx.beginPath();
  ctx.moveTo(dw*0.33, dh*0.5);
  ctx.lineTo(dw*0.67, dh*0.5);
  ctx.stroke();
}

function initCanvasSize($canvas, width, maxWidth, aspectRatio) {
  var newWidth = Math.min(width, maxWidth);
  $canvas.width = newWidth;
  $canvas.height = Math.ceil(newWidth * aspectRatio);
}

function handleDecodeResult(payload) {
  if (found) {
    return;
  }
  if (payload.EAN && payload.EAN.length > 0) {
    found = true;
    showResults(payload.EAN.toString(), TimeKeeper.end())

    //cancel next scan
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  } else {
    showResults('...', TimeKeeper.end())
    doScan();
  }
}

function handleStatusUpdate(payload) {
  if (payload.status === 'ready') {
    wwReady = true;
  }
}

// receive worker messages
function handleWwMessage(e) {
  console.log('received', e.data.type)

  switch (e.data.type) {
    case 'decoding': 
      handleDecodeResult(e.data.payload);
      break;
    case 'status':
      handleStatusUpdate(e.data.payload);
      break;
    default:
      break;
  }
}

})()