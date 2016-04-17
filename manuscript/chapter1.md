# Utilizing The Transport: HTTP Headers

Working on web applications mean we ride on communication protocols which already set standards for how to transfer data and how to manage it.

Browsers utilize HTTP headers to enforce and confirm such communication standards and security policies.

## NodeJS Libraries

Let's review two libraries which we can use to implement these HTTP headers and apply the solution required for each security mechanism that we will be reviewing:
* Lusca
* Helmet

### Helmet

Helmet is a pluggable library for ExpressJS which provide a wide range of solutions related to the transport security layer, such as Cross-Site-Scripting (XSS) security, X-Frame protection and many others.

[![npm version](https://badge.fury.io/js/helmet.svg)](http://badge.fury.io/js/helmet)
[![npm dependency status](https://david-dm.org/helmetjs/helmet.png)](https://david-dm.org/helmetjs/helmet)
[![Build Status](https://travis-ci.org/helmetjs/helmet.svg?branch=master)](https://travis-ci.org/helmetjs/helmet)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Helmet, being a collection of transport security libraries, is well maintained and kept up to date.

I> # More on Helmet
I>
I> Helmet has been around originally since 2012 and is considered matured and production-ready with stable releases and adoption by many frameworks and NodeJS projects.
I> It is mainly developed by Evan Hahn, and Adam Baldwin who maintain some dozen npm packages and are very actively involved in ExpressJS and other NodeJS projects on GitHub.

Helmet's libraries work by introducing middlewares for ExpressJS which can respond to requests being served by an ExpressJS application.

### Lusca

Lusca is another library to help secure the HTTP transport layer, similar to Helmet, and provides a collection of configurable options to add protection for risks related to Cross-Site-Request-Forgery (CSRF), Content-Security-Policy, and others.

Lusca integrates with ExpressJS web applications using a middleware implementation to mitigate some of the HTTP transport layer vulnerabilities. It is mainly developed and maintained by team members from PayPal who officialy sponsor the work on this library, currently lead by Jean-Charles Sisk.

[![Build Status](https://travis-ci.org/krakenjs/lusca.svg?branch=master)](https://travis-ci.org/krakenjs/lusca)
[![NPM version](https://badge.fury.io/js/lusca.svg)](http://badge.fury.io/js/lusca)  

T> ## Security-oriented frameworks
T>
T> Lusca is a library which is part of a bigger web application framework called [kraken.js](https://github.com/krakenjs/kraken-js) that focuses on security first, and is too, officially maintained by PayPal's own people.

## Strict Transport Security

Strict Transport Security, also known as HSTS, is a protocol standard to enforce secure connections to the server via HTTP over SSL/TLS.
HSTS is configured and transmitted from the server to any HTTP web client using the HTTP header *Strict-Transport-Security* which specifies a time interval during which the web client should only communicate over an HTTP secured connection (HTTPS).

T> ## Tip
T>
T> When a *Strict-Transport-Security* header is sent over HTTP the web client ignores it because the connection is unsecured to begin with.

### The Risk

The risks that may arise when communicating over a secure HTTPS connection is that a malicious user can perform an Man-In-The-Middle (MITM) attack and down-grade future requests to the web server to use an HTTP connection, thus being able to sniff and read all the data that flows through.

I> ## Interesting fact:
I> The [original HSTS draft](https://tools.ietf.org/html/rfc6797) was published in 2011 by Jeff Hodges from PayPal,
I> Collin Jackson from Carnegie Mellon University, and Adam Barth from Google.
I>

Sending HTTP requests to the web server even though an HTTPS connection was initially made is not a problem on its own, as the user is unaware of why this is happening and wouldn't necessarily suspect. Perhaps the server has a REST endpoint which is not yet HTTPS-supported?

In the following flow diagram, Figure 1-1, we can see an example scenario where the server returns an HTML file for the login page to the browser, which includes some resources that are accessible over HTTP, like the submit button's image. If an attacker is able to perform a Man-In-The-Middle attack and "sit on the wire" to listen and sniff any un-encrypted traffic that flows through, then they can essential access and read those HTTP requests which include sensitive data such as the user's cookie.
Even worse scenarios may include HTTP resources set for POST or PUT endpoints where actual data is being sent and can be sniffed.

![Figure 1-1 - Visualizing HTTPS MITM Attack](images/figure1-1.png)

### The Solution

When web servers want to protect their web clients through a secured HTTPS connection, they need to send the *Strict-Transport-Security* header with a given value which represents the duration of time in seconds which the web client should send future requests over a secured HTTPS connection.

e.g. telling the web client to send further secure HTTPS requests for the next hour.
```
Strict-Transport-Security: max-age=3600
```

### Helmet Implementation

To use Helmet's HSTS library we need to download the npm package and we will also add it as a package dependency to the NodeJS project we're working on:

```bash
npm install hsts --save
```

Let's setup the hsts middleware to indicate web client such as a browser that it should only send HTTPS requests to our server's hostname for the next 1 month:

```js
var hsts = require('hsts');

// Set the expiration time of HTTPS requests to the server to 1 month, specified in milliseconds
var reqDuration = 2629746000;

app.use(hsts({
  maxAge: requestsDuration
}));
```

In the above snippet `app` is an ExpressJS app object, which we are instructing to use the hsts library.

A quite common case is where web servers also have sub-domains to fetch assets from, or make REST API calls to, in which case we would also like to protect them and enforce HTTPS requests. To do that, we can include the following optional parameter to the hsts options object:

```js
  includeSubDomains: true
```

### Lusca Implementation

If Lusca is not yet installed we can install it with npm as follows:

```bash
npm install lusca --save
```

Once lusca is installed, we can set it up for HSTS support with an ExpressJS application setup:

```js
var lusca = require('lusca');

// Set the expiration time of HTTPS requests to the server to 1 month, specified in milliseconds
var reqDuration = 2629746000;

app.use(lusca({
  hsts: {
    maxAge: requestsDuration
  }
}));
```

As can be seen, using lusca is very similar to using helmet, including their optional arguments like `maxAge`, and `includeSubDomains`.
