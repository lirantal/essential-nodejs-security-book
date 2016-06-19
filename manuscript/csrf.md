# Cross-Site Request Forgery (CSRF)

Named after the attack it employs, a CSRF tricks the victim to unknowingly send requests to a system where the user has access to, and is presumably already logged-in to. Usually these attacks are targeted by nature as the attacker would have to craft a CSRF and trick the user into performing an action on another system than that of the attacker. Thus, the attacker probably has previous knowledge of the target system for which the CSRF is crafted.

T> ## Known by other names
T>
T> CSRF has a bunch of other names which other vendors and communities use, namely: One-Click attack by Microsoft, Session Riding, and is often even abbreviated as XSRF.

## The Risk

An example use case is where a vulnerable web application might have a form which makes use of the GET method to be submitted and so it receives its input field data from the query parameters. In this case, a user can be easily tricked into submitting that GET method HTML FORM through several ways:
* An fake e-mail or website, attracting the user to click on a link or even just try to render an image that will lead to submitting this form. For example:
```html
<img src="http://target-web-application.com/updateEmailAddress.php?email=attacker@domain.com" />
```
When the user's email client will attempt to interpret this HTML piece and render the image tag then it will actually cause the browser to make that request on behalf of the user. If the user is logged-in then this example GET method FORM will be submitted, resulting in the user's email address to be changed.

* A naive-looking link can also lead the user to click on it without the user's knowledge of what this link action actually calls to:
```html
<a href="http://target-web-application.com/updateEmailAddress.php?email=attacker@domain.com"> Read More </a>
```

Updating the form implementation to use POST or PUT requests doesn't provide any higher level of security for implementing secure forms. Some examples for attacking these forms are:
* The attacker controls a website which can contain a naive-looking form submission with the action path set to the targeted vulnerable web application. For example:
```html
<form action="http://target-web-application.com/updateEmailAddress.php" method="post">
<input type="hidden" name="email" value="attacker@domain.com" />
<input type="submit" value="Continue" />
</form>
```
When clicked, the browser will send a request to the path specified in the *action* property with a hidden key/value pair of updating the user's email address.

* An attacker can also leverage JavaScript code to submit the former POST method FORM example with the page load event so the user has nothing to say about it (except if the user has JavaScript disabled):
```html
<body onLoad="document.forms[0].submit()">
```

* Another case which can be exploited by the user is to create an AJAX request which trigger the browser to process and send this request:
```js
<script type="text/javascript">
var xhr = new XMLHttpRequest();
xhr.open("POST", "http://target-web-application.com/updateEmailAddress.php");
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.send("email=attacker@domain.com");
</script>
```
This AJAX request can also run automatically when the user loads the attacker's web page with simply binding it to the *onLoad* event.

An even greater risk is where the target web application is actually hosting the CSRF code.
For example, if the web application allows rich text comments, forums, or any other rich user input then it makes a very appealing target for attackers to inject a CSRF attck there and greatly increase this vulnerability.

## The Solution

As described when reviewing the possible risks of CSRF, any attempts to attempt and harden an HTML FORM entity are futile and are mere annoyance for an attacker to workaround, but such attempts are definitely not the solution.

To be clear, let's review what would be a wrong way of approaching a CSRF solution:
1. Changing the FORM *method* attribute from GET to POST
2. Changing the FORM *action* attribute value from HTTP to HTTPS endpoint, or updating the URI to a full URL.
3. Deprecating all the FORM elements and converting them to API endpoint
4. Adding further actions to confirm the FORM submission such as popups or secondary forms
5. Storing any hidden information inside a Cookie to authorize requests

All of the above are examples of what not to do in order to protect against CSRF vulnerabilities, because some are either wrong, give an illusion of a solution, or simply do not fix the problem entirely.

### CSRF Tokens

The preferred way to protect against CSRF attacks is by generating a token, which is in essence a random, unguessable string, for every action that is performed by the user. With every user's action this token is then being compared between what the user sent and what the server expects (the previous token that was generated). In cases where the comparison fails the CSRF tokens mis-match and the action is being denied as well due to a potential attack.

CSRF tokens can be further secured by not using a single token for the entire user session, which might be common with Single Page Application architecture (SPA), but rather new tokens can be generated and compared with for every form action submitted or similar user action being taken.

I> ## Unreadable characters we call CAPTCHAs
I>
I> The concept of CAPTCHAs was initially introduced to mitigate user spam, bots, and automated web crwaling. It is a possible solution to add security for forms and actions but it is not user friendly.
I>
I> By the way, did you know that the meaning of CAPTCHA is: Completely Automated Public Turing Test To Tell Computers and Humans Apart. Luckily we have an acronym for it.

### CSRF Tokens Implementation

There are several ways to implement the CSRF Token and they vary and depend on a web application's architecture. The fundamentals of comparing a generated token with the one received in the input remains the same, only the delivering and exchanging the token between the server and the client changes.

#### Request Body

With the Request Body implementation, the server generates the CSRF token which is then being used in the view layer to be placed on the forms to be submitted as a hidden input element. When the user submits the form, the hidden input element with the CSRF value is also sent as part of the request body, which is then received by the server and the server can compare the CSRF token from the input to the token that was generated with the page view.

This approach requires per page handling of the CSRF token so it must be pre-planned and designed when creating the web page, hence making it cumbersome from application architecture perspective. Moreover, with Single Page Applications (SPA) the architecture dictates a single page load, so the server is actually generating the CSRF token only one time, and that token needs to be compared with every subsequent requests being sent by the web application.

#### CSRF Cookie

Most web applications require to utilize cookies for client-side storage and maintaining a session in a stateless HTTP protocol. By leveraging the cookie store, the web application can set a CSRF cookie with the token's value. At this point all the cookies for the web application will be sent with every request the user makes to the server, including the previously set CSRF token cookie. When the server receives these requests it is checking the CSRF token cookie value and compares it with what it generated when the session started for the user.

#### CSRF Token Header

Relying on a custom HTTP header to exchange information about the CSRF token is considered a high level of security, since it requires from an attacker to actually be able to "sniff" the network traffic or perform a Man-In-The-Middle (MITM) attack.

In cases where both the server and the client utilize the specific CSRF Token Header then when the server generates the token it responds with this special token, and when the client receives the response it can parse the HTTP header for the token value, and then sends it back to the server as the same HTTP header which the server expects.

#### CSRF Libraries - under the hood

Inspecting the [source code of csurf](https://github.com/expressjs/csurf/blob/master/index.js#L115) library provides more insight on the internals of how a CSRF library handles the token and where it expects it, with the order of precedence:

```js
/**
 * Default value function, checking the `req.body`
 * and `req.query` for the CSRF token.
 *
 * @param {IncomingMessage} req
 * @return {String}
 * @api private
 */

function defaultValue(req) {
  return (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['csrf-token'])
    || (req.headers['xsrf-token'])
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
}
```

If a token comparison failed, the [csurf library will thrown an error](https://github.com/expressjs/csurf/blob/master/index.js#L115):

```js
/**
 * Verify the token.
 *
 * @param {IncomingMessage} req
 * @param {Object} tokens
 * @param {string} secret
 * @param {string} val
 * @api private
 */

function verifytoken(req, tokens, secret, val) {
  // valid token
  if (!tokens.verify(secret, val)) {
    throw createError(403, 'invalid csrf token', {
      code: 'EBADCSRFTOKEN'
    });
  }
}
```

### ExpressJS csurf Library

[csurf](https://github.com/expressjs/csurf) is another middleware from the ExpressJS family, which provides a mechanism to manage CSRF tokens.

[![NPM Version](https://img.shields.io/npm/v/csurf.svg)](https://npmjs.org/package/csurf)
[![NPM Downloads](https://img.shields.io/npm/dm/csurf.svg)](https://npmjs.org/package/csurf)
[![Build status](https://img.shields.io/travis/expressjs/csurf/master.svg)](https://travis-ci.org/expressjs/csurf)
[![Test coverage](https://img.shields.io/coveralls/expressjs/csurf/master.svg)]([https://coveralls.io/r/expressjs/csurf?branch=master)

The *csurf* library makes use of either the server's session storage or the client's cookie storage to persist and compare the CSRF token, therefore it must be used together with either of them. This chapter will cover usage with both of these options.

Installing csurf for use in an expressjs project:

```bash
npm install csurf --save
```

#### csurf With Cookies

csurf requires the very least [body-parser](https://github.com/expressjs/body-parser) library to access the data from the *req* object, and then either the session library, or the [cookie-parser](https://www.npmjs.com/package/cookie-parser) library to persist the CSRF token value.

At first, all the libraries are required in the code:

```js
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
```

Next, the libraries are initialized and configured:

```js
// initialize the body-parser library
app.use(bodyParser.urlencoded());

// setup cookie information
app.use(cookieParser('secretKey'));
```

Only then, the csurf middleware can be initialized (this order of middlewares is important). csurf is configured to use the cookies storage and is added as part of the middleware for an ExpressJS *app* object:

```js
var csrfToken = csrf({cookie: true});
app.use(csrfToken);
```

From this point on, all is left is to configure the route to have access to the CSRF token. By using a simple example where a view renders an HTML FORM element, the route provides the CSRF token to the hidden CSRF token input field.

```js
app.get('/login', function(req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken()
  })
});
```

The view for the */login* route is a simple FORM that uses the *csrfToken* variable in the template as part of a hidden input field:

```html
<form action="/login" method="post">
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
<button type="submit">Submit</button>
</form>
```

The view references the */login* path when submitted and sends this as a POST HTTP request.
The example route added below to handle the form submission will only meet and return an HTTP 200 response if the CSRF token passed validation:

```js
app.post('/login', function(req, res, next) {
  res.status(200).send({
    'csrf': 'ok'
  });
});
```

#### csurf With Session

At first, all the libraries are required in the code:

```js
var bodyParser = require('body-parser');
var session = require('express-session');
var csrf = require('csurf');
```

Because we are using sessions for persistence, the session ideally needs to be configured, and we also initialize the body-parser library so that csurf middleware can locate the required token in the *req* object:

```js
// configure session and cookie details
app.use(session({
  name: 'csrfExampleSession',
  secret: 'csrfSecretExampleKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: null,
    httpOnly: true,
    secure: false
  }
}));

// initialize the body-parser library
app.use(bodyParser.urlencoded());
```

From this point on, the flow is similar to how the csrf with cookies configuration works.
All is left is to configure the route to have access to the CSRF token. By using a simple example where a view renders an HTML FORM element, the route provides the CSRF token to the hidden CSRF token input field.

```js
app.get('/login', function(req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken()
  })
});
```

The view for the */login* route is a simple FORM that uses the *csrfToken* variable in the template as part of a hidden input field:

```html
<form action="/login" method="post">
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
<button type="submit">Submit</button>
</form>
```

The view references the */login* path when submitted and sends this as a POST HTTP request.
The example route added below to handle the form submission will only meet and return an HTTP 200 response if the CSRF token passed validation:

```js
app.post('/login', function(req, res, next) {
  res.status(200).send({
    'csrf': 'ok'
  });
});
```

### ExpressJS With lusca Library

[lusca](https://github.com/krakenjs/lusca) is a web application security middleware, which amongst many other features that were covered in earlier chapters, also provides CSRF Token security and integrates with web application frameworks such as ExpressJS.

[![Build Status](https://travis-ci.org/krakenjs/lusca.svg?branch=master)](https://travis-ci.org/krakenjs/lusca)  
[![NPM version](https://badge.fury.io/js/lusca.svg)](http://badge.fury.io/js/lusca)  

Similar to [csurf](https://github.com/expressjs/csurf), *lusca* also requires either a session or cookie middleware for storage and persistence, as well as the *body-parser* middleware.

Installing lusca if this hasn't been done in previous chapters:

```bash
npm install lusca --save
```

#### lusca With Session

The application setup is very similar to that of *csurf* so it is provided here as a full source code example and the *csurf* sections can be referred to for specific references of each chunk of code.

```js
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var lusca = require('lusca');

// configure session and cookie details
app.use(session({
  name: 'luscaCsrfExampleSession',
  secret: 'luscaCsrfSecretExampleKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: null,
    httpOnly: true,
    secure: false
  }
}));

app.use(bodyParser.urlencoded());

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
```
