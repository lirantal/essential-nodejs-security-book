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
