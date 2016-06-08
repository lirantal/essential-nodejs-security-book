'use strict';

var express = require('express');
var limiter = require('express-limiter');

// create a redisClient object with default connection information
var redisClient = require('redis').createClient();

// web server port
var _PORT = 3000;

// instantiate an express's app variable
var app = express();

// bind the limiter object the express app object and pass the redisClient
// object so it knows how to persist the imposed limits
var limits = limiter(app, redisClient);

/**
 *  Configuring the following limits:
 *  - Limit all type of requests (GET, POST, PUT, etc) to the /login path
 *  - Limit the requests based on the incoming IP address
 *  - Allow a total of 20 requests per hour
 */
limits({
  path: '/login',
  method: 'all',
  lookup: ['connection.remoteAddress'],
  total: 20,
  expire: 1000*60*60
});

app.get('/login', function(req, res, next) {
  // we send a dummy object for every request being made to /login path
  res.status(200).send({'login': 'ok'});
});

app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
