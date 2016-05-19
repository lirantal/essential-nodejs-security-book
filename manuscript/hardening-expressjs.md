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
