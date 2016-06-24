'use strict';

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var lusca = require('lusca');

// web server port
var _PORT = 3000;

// instantiate an express's app variable
var app = express();

// configure session and cookie details
app.use(session({
  name: 'luscaCsrfExampleSession',
  secret: 'luscaCsrfSecretExampleKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: null,
    httpOnly: true,
    // this example does not make create an HTTPS server so we set secure
    // to false so the cookie will be present in HTTP communication
    secure: false
  }
}));

app.use(bodyParser.urlencoded());

// configure the views directory and the view engine for ejs support
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var luscaCsrf = lusca({csrf: true});
app.use(luscaCsrf);

app.get('/login', function(req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken()
  })
});

app.post('/login', function(req, res, next) {
  res.status(200).send({
    'csrf': 'ok'
  });
});

app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
