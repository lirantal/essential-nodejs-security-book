'use strict';

var express = require('express');
var esapi = require('node-esapi');

// web server port
var _PORT = 3000;

// instantiate an express's app variable
var app = express();

var esapiEncoder = esapi.encoder();

// configure the views directory and the view engine for ejs support
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res, next) {
  res.render('main', {
    nameRaw: req.query.nameRaw,
    nameEncoded: esapiEncoder.encodeForHTML(req.query.nameEncoded),
    numberSafeEJS: req.query.numberSafeEJS
  })
});

app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
