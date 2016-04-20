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

## X-Frame-Options

The [X-Frame-Options](http://tools.ietf.org/html/7034) HTTP header was introduced to mitigate an attack called Clickjacking which allows an attacker to disguise page elements such as buttons, and text inputs by hiding their view behind real web pages which render on the screen using an iframe HTML element, or similar objects.

I> ## Deprecation notice
I>
I> The X-Frame-Options header was never standardized as part of an official specification but many of the popular browsers today still support it.
I> It's successor is the Content-Security-Policy header which will be covered in the next section and one should focus on implementing CSP for new websites being built.


### The Risk

[Clickjacking](https://www.owasp.org/index.php/Clickjacking) attack is about mis-leading the user to perform a seemingly naive and harmless operation while in reality the user is clicking buttons of other elements or typing text into an input field which is under the user's control.

Common examples of employing Clickjacking attack:
1. If a bank, or email account website doesn't employ an X-Frame-Options HTTP header then a malicious attacker can render them on an iframe, and place the attacker's own input fields on the exact location of the bank or email website's input for username and password and to record your credentials information.
2. A web application for video or voice chat that is in-secure can be exploited by this attack to let the user mistakenly assume they are just clicking around on the screen, or playing a game, while in reality a series of clicks are actually turning on your web camera or microphone.

### The Solution

To mitigate the problem, a web server can respond to a browser's request with an `X-Frame-Options` HTTP header which is set to one of the following possible values:
1. DENY - Specifies that the website can not be rendered in an iframe, frame, or object HTML elements.
2. SAMEORIGIN - Specifies that the website can be rendered only if it is requested to be embedded on an iframe, frame or object HTML elements from the same domain.
3. ALLOW-FROM <URI> - Specifies that the website can be framed and rendered from the provided URI value. Important to notice that you can't specify multiple URI values, but are limited to just one.

A few examples to show how this header is set are:
```
X-Frame-Options: ALLOW-FROM http://www.mydomain.com
```

and

```
X-Frame-Options: DENY
```

T> ## Caution of Proxies
T>
T> Web proxies are often used as a means of caching and they natively perform a lot of headers manipulation.
T> Beware of proxies which may remove this or other security related headers.

### Helmet Implementation

With helmet, implementing this header is as simple as requiring the helmet package and using ExpressJS's `app` object to instruct ExpressJS to use the xframe middleware provided by helmet.

Setting the X-Frame-Options to completely deny any frames:

```js
var helmet = require('helmet');

app.use(helmet.frameguard({
  action: 'deny'
}));
```

Similarly, we can allow frames to occur only from the same origin by providing the following object:
```js
{
  action: 'sameorigin'
}
```

Or to allow frames to occur from a specified host:
```js
{
  action: 'allow-from',
  domain: 'https://mydomain.com'
}
```


### Lusca Implementation

If lusca library is already installed and our ExpressJS application is already configured and provides the `app` object, then:

```js
var lusca = require('lusca');

app.use(lusca({
    xframe: 'SAMEORIGIN'
  }
));
```
