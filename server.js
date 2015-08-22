var express = require('express');
var path = require('path');
var firebaseApi = require('./server/firebaseApi');

var app = express();

var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// views is directory for all template files
var viewsPath = path.resolve(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');

var renderWithPreview = function(notebookId, pictureId, response) {
  response.render('pages/index', {
    pngUrl: 'http://www.dashdrawer.com/png/' + notebookId + '/' + pictureId
  });
};


app.get('/', function(request, response) {
  renderWithPreview('default', 'bars', response);
});

app.get('/notebook/:notebookId/picture/:pictureId/*', function(request, response) {
  var notebookId = request.params.notebookId;
  var pictureId = request.params.pictureId;
  renderWithPreview(notebookId, pictureId, response);
});

app.get('/png/:notebookId/:pictureId', function(request, response) {
  var notebookId = request.params.notebookId;
  var pictureId = request.params.pictureId;
  firebaseApi.getPngUri(notebookId, pictureId, function(pngUri) {
    response.render('pages/png', {
      pngUri: pngUri
    });
  });
});

app.get('/fonts/*', function(request, response) {
  // TODO - I don't have enough control of the build system to get it to go where I want
  var fontPath = path.join(publicPath, 'build', request.originalUrl);
  console.log('sending file', fontPath);
  response.sendFile(fontPath);
});

var serverType = process.env.NODE_ENV === 'production' ? 'pro' : 'dev';
var server = require('./server/' + serverType + '.js');
server(app);

