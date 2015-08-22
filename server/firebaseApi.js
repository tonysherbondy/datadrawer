var fs = require('fs');
var path = require('path');
var Firebase = require('firebase');

var myFirebaseRef = new Firebase('https://datadrawer.firebaseio.com/pngs');

function getDefaultPngUri(cb) {
  var defaultUriPath = path.resolve(__dirname, 'defaultPngUri');
  fs.readFile(defaultUriPath, function (err, data) {
    if (err) { throw err; }
    cb(data.toString());
  });
}

exports.getPngUri = function(notebookId, pictureId, cb) {
  var pngRef = myFirebaseRef.child(notebookId + '/' + pictureId + '/uri');
  console.log('get png from DB entry', pngRef.toString());
  pngRef.once('value', function(data) {
    var pngUri = data.val();
    if (!pngUri) {
      getDefaultPngUri(cb);
    } else {
      cb(pngUri);
    }
  });
};
