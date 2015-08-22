
module.exports = function(app) {
  var port = process.env.PORT || 3000;
  // And run the server
  app.listen(port, function () {
    console.log('Server running on port ' + port);
  });
};
