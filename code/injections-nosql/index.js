'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// web server port
var _PORT = 31337;

// connect to db
mongoose.connect('mongodb://localhost/xss-nosql');

// instantiate mongoose schema
require('./user.model.js');
var User = mongoose.model('User');

// seed the database with a demo user just for tests
User.update({}, {username: 'demo', password: 'demo'}, {upsert: true}, function(err) {
  console.log('err');
  console.log(err);
});

// create an express app
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// un-secured version which produces sql-injections
app.get('/login', function(req, res) {
  res.sendFile('./login.html', { root: __dirname } );
});

app.post('/login', function(req, res) {
  console.log('Performing login');

  User.find({ username: req.body.username, password: req.body.password }, function(err, users) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(users);
    }
  });
});

// secure version which mitigates sql injections
app.get('/loginSecured', function(req, res) {
  res.sendFile('./loginSecured.html', { root: __dirname } );
});

app.post('/loginSecured', function(req, res) {
  console.log('Performing secure login');

  // coerce the req.body properties into strings, resulting in [object object] in case
  // of a converted object instead of a real string
  // another convention is to call the object's .toString();
  User.find({ username: String(req.body.username), password: String(req.body.password) }, function(err, users) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(users);
    }
  });
});

app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
