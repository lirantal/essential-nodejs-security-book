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

## Advanced Functionality Limiting

More tweaking can be performed to your web server layer to further close down on possible attack vectors.
A library from Yahoo! allow for alerting these settings and is called [limits](https://github.com/yahoo/node-limits), or *node-limits* if you would like to research it more on their GitHub page.

For example, if your web application has no notion of file uploads then you can disable completely these types of form submissions. If you do allow file uploads, you can limit the maximum size of a request that is sent to you for processing. These can help reduce any attempts to slow down your bandwidth and network pipeline and reduce temporary disk space or any operations that are performed by your web application to process file uploads.

Other tweaks this library provide is to configure timeout thresholds. For example, you may want to set a global timeout for incoming connections to make sure that an attacker does not attempt to keep many sockets opened on your web server OS.

Installing the *limits* library and updating the *package.json*:

```
npm install limits --save
```

Creating the following limit configuration:

* Disable file uploads
* Limit all requests to a total of 2 megabytes
* Set a global timeout for incoming connections to 1 minute

```js
var nodeLimits = require('limits');

app.use(nodeLimits({
  file_uploads: false,
  post_max_size: 2000000,
  inc_req_timeout: 1000*60*60
}));
```

## body-parser middleware

The [body-parser](https://github.com/expressjs/body-parser) middleware augments ExpressJS web framework with support for requests being made and parsing the HTTP body data for common data types such as JSON. *body-parser* is quite popular and is reported to serve more than five million downloads a month.

![](images/bodyparser-badges.png)

As seen with the previous *limits* library, it is possible to limit the incoming request size so it doesn't cause server CPU strain to parse the body object. Where the *limits* library may be an overkill for some web applications, *body-parser* is quite common and can be set to limit the specific requests it handles to provide security.

To install and update the *package.json* file with the *body-parser* library:

```
npm install body-parser --save
```

Limiting request sizes works as follows:

```js
var bodyParser = require('body-parser');

// instruct bodyParser to parse JSON data and populate the body data payload
// in the request object *req* with an actual JSON object
app.use(bodyParser.json({
  limit: '1mb'
}));
```

Once the limit has been set, when an incoming request is bigger than the limit then ExpressJS will emit the error *request entity too large* which is a standard HTTP response and reply with a 413 HTTP code.

I> ## enforcing limits
I>
I> Remember that *body-parser* only handles non-multipart form submissions so setting this limit will not affect file uploads being sent to your web application.

{pagebreak}

## Summary

In this chapter we reviewed some tools and configurations that aid in hardening an ExpressJS web application, such as implementing rate limiting to mitigate flood of requests, implmenting quota for file uploads and generally hiding the details of ExpressJS as the application framework.

The ExpressJS documentation also provides further details and insights with regards to security best practices that help harden and secure ExpressJS applications. [Product Best Practices](http://expressjs.com/en/advanced/best-practice-security.html) review some of this information and will most probably receive updates in the future so this is always a good resource to keep track on.
