"use strict";

const express = require("express");
const helmet = require("helmet");

// web server port
const _PORT = 3000;

// helmet configuration
const reqDuration = 2629746000;

const app = express();

app.use(
  helmet.hsts({
    maxAge: reqDuration,
    includeSubDomains: true,
  })
);

app.use(
  helmet.frameguard({
    action: "sameorigin",
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "https://ajax.googleapis.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      childSrc: ["'none'"],
      objectSrc: ["'none'"],
      formAction: ["'none'"],
    },
  })
);

app.use(helmet.xssFilter());
app.use(helmet.noSniff());

app.use((req, res, next) => {
  console.log(res.outHeadersKey);
  next();
});

app.get("/", function (req, res) {
  console.info(res.getHeaders());
  res.status(200).send(res.getHeaders());
});

app.listen(_PORT, function () {
  console.info("App started on port: " + _PORT);
});
