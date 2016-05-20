# Hardening ExpressJS

While ExpressJS is a very popular, and mature library for a web application framework it still can be tuned beyond the default options that it uses and those that are used by its related middleware plugins. ExpressJS is trusted by many users to run in production sites, and an extra attention to details and how to augment it are crucial in ensuring you have a security-hardened setup.

## Security Through Obscurity

ExpressJS follows standards for HTTP web servers and as such it will send by default the *X-Powered-By* header which reports to any web request which web server is processing the request. Such information disclosure for attackers is welcomed with open arms as they have gained knowledge on which framework you are using and can focus their request to speer attacks specific to ExpressJS.

One of the first, very basic and easy hardening action web applications can take is to remove this header:

```js
var express = require('express');
var app = express();

app.disable('x-powered-by');
```

## Brute-Force Protection

Brute-force attacks may be employed by an attacker to send a series of username/password pairs to your REST end-points over POST or another RESTful API that you have opened to implement them. Such a dictionary attack is very straight-forward and easy to execute and may be performed on any other parts of your API or page routing, unrelated to logins.

A popular use-case is where you may have an administrative interface at the */admin* route and an attacker may try to issue automated requests there with different tokens, different cookie identifier etc to try and get in.

To help mitigate and limit requests being made to your web application we can leverage a library called [express-limiter](https://github.com/ded/express-limiter) which provides a very flexible configuration to integrate into an ExpressJS application.

I> ## Pre-requisite
I>
I> A pre-requisite for using *express-limiter* is that it requires a Redis datastore to connect to and manage the limits it imposes per request.

Installing *express-limiter* and updating our *package.json* file with its entry:
```
npm install express-limiter --save
```

Let's create the following limit:
* Limit all type of requests (GET, POST, PUT, etc) to the */login* path
* Limit the requests based on the incoming IP address
* Allow a total of 20 requests per hour

```js
var express = require('express');
var limiter = require('express-limiter');

// create a redisClient object with default connection information
var redisClient = require('redis').createClient();

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
```

The *lookup* key passed to the *limits* object is very flexible and by default it will match any object/property options in ExpressJS request object. A short list of useful and informative request object properties are:
* headers.host
* headers.user-agent
* headers.accept-language
* headers.x-forwarded-for
* connection.remoteAddress and connection.remotePort
* url
* method
* path
* query
* protocol
* xhr
* ip

Usually other middlewares like *passport* which provide authentication and authorization capabilities extend the *req* object with more data such as the user information when logged in. Therefore another option to limit requests by is per the user id: *user.id*, or by username: *user.username*.

More information on how to limit requests based on other methods is available on [express-limiter GitHub page](https://github.com/ded/express-limiter).
