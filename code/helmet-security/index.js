'use strict';

var express = require('express');
var helmet = require('helmet');

// web server port
var _PORT = 3000;

// helmet configuration
var reqDuration = 2629746000;

var app = express();

app.use(helmet.hsts({
  maxAge: reqDuration,
  includeSubDomains: true
}));
app.use(helmet.frameguard({
  action: 'sameorigin'
}));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'https://ajax.googleapis.com'],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    childSrc: ["'none'"],
    objectSrc: ["'none'"],
    formAction: ["'none'"]
  }
}));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());


app.get('/', function(req, res) {
  console.info(res._headers);
  res.status(200).send(res._headers);
});

app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
