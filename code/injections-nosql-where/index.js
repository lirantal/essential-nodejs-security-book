'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb');

// web server port
var _PORT = 31337;

// global reference for the database
var globalDB;
var usersCol;

// connect to db
MongoClient.connect('mongodb://localhost:27017/injection-nosql-where', function(err, db) {
    console.log("Connected to MongoDB server");
    globalDB = db;

    // Define the collection
    usersCol = db.collection('users');

    // Seed the database with sample data
    usersCol.insert({age: 50}, function(err, res) {
      if (err) {
        console.log(err);
      }

      console.log(`Inserted ${res.result.n} documents`);
    });
});


// create an express app
var app = express();

// setup view templating
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// un-secured version which produces sql-injections
app.get('/', function(req, res) {
  console.log('processing request to /');
  res.render('users', { users: [] });
});

app.get('/user', function(req, res) {
  console.log('processing request to /user');

  var ageThreshold = req.query.age;
  var searchCriteria = "this.age > " + "'" + ageThreshold + "'";

  usersCol.find({
    $where: searchCriteria
  }).toArray(function(err, response) {

    // Array of resulting documents that match our search criteria
    console.log(response);

    res.render('users', { users: response });

  });
});


app.listen(_PORT, function() {
  console.info("App started on port: " + _PORT);
});
