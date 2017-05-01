# DeBarcode
### Pure Javascript EAN-13 barcode reader

## Algorithm 
This library uses the SlaRle algorithm which consists of two parts: localization and decoding.  
Localization is based on an [algorithm from Stern](http://pi4.informatik.uni-mannheim.de/~haensel/bar_codes_ma.pdf)  with enhanced parameterization.  
Decoding follows the description from [O'Sullivan et al.](http://book.realworldhaskell.org/read/barcode-recognition.html) with the additional feature of scanline movement if a scan wasn't successful.

The implementation was adapted from this repo: https://github.com/Rohrlaf/SlaRle.js  
Main changes:
- Code cleanup and organization
- Use typed arrays for image processing for improved performance
- Implement an example that works with live camera feed

## Caveats
Due to current limitations with accessing a device's camera in the browser, the live camera feed example only works on some Android devices.  
Specifically, the camera auto-focus must be active in this case, otherwise the barcode image in the feed from the camera will be blurry and thus can't be decoded.  
As of now (mid 2017) there is no standard way to control autofocus from the browser, so whether auto focus is enabled depends on the implementation of the camera interface in each Android phone.  

## Other JS barcode decoding libraries
- [BarcodeReader](https://github.com/EddieLa/JOB)
- [WebCodeCamJS](https://github.com/andrastoth/webcodecamjs)
- [quaggaJS](https://serratus.github.io/quaggaJS)
- [A Gist](https://gist.github.com/tobytailor/421369)
