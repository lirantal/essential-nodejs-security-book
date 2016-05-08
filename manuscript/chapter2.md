# Session Management

If your web application is completely stateless and requires no user customization at all, and no user tracking then you probably don't even need to worry about users and sessions management, and your application became way more secure than it was with sessions. Better yet, you can leverage caching proxies, CDNs and very easy

The other scenario is that you need to serve content customized for users, allow them to login and perform some actions, or maintain a user related activity.
This is where things get tricky and need proper attention to whole lot more details of information security.

HTTP being a stateless communication protocol, there-fore creating the need for a mechanism to track and maintain user's actions when interacting with a web applications - sessions.

The focus of this chapter will discuss Cookies based session management which is the most wide-spread way of maintaining sessions for web applications.

## Session Security Risks

Improper session management in web applications may lead to several vulnerabilities that can be exploited by attackers.

I> To understand session security in depth we first must own a basic understanding I> of sessions management: a web server keeps track of the user's browsing
I> interaction by saving to the user's browser a token, often refereed to as session I> id, which it uses to identify this unique user for further requests and interactions made between the user and the web server.

Reviewing a few examples of session related attacks:
* **Session Fixation** - by employing several vectors of attack, it attempts to gain a valid session on the browser, and then fixing the victim's browsing session to use the already existing session that attacker owns. Possible attack vectors are Cross-Site-Scripting (XSS), Meta Tag Injections, Session Adoption and others.
* **Session Hijacking** - an attacker will employ similar attack vectors such as XSS, and may also employ a MITM attack to reveal a valid user's session id so it can be hijacked by the attacker and made use of.

The risk and impact of any session attack is owning the user's identity and thus having the same privileged session as the user does. To compare with Unix attacks which may exploit root privilege escalation attacks, this introduces possibly the greatest risk for web applications as well.

T> ## On Session Management
T>
T> OWASP maintains an up to date [Session Management](https://www.owasp.org/index.php/Session_Management_Cheat_Sheet) checklist to validate your web security compliance with security standards.

## Session Security in NodeJS and ExpressJS

ExpressJS utilizes the [express-session](https://github.com/expressjs/session) middleware for session management.
The project is well maintained, tested and de-facto solution for session management in NodeJS.

[![npm version](https://img.shields.io/npm/v/express-session.svg)](https://npmjs.org/package/express-session)
[![npm downloads](https://img.shields.io/npm/dm/express-session.svg)](https://npmjs.org/package/express-session)
[![Build Status](https://img.shields.io/travis/expressjs/session/master.svg)](https://travis-ci.org/expressjs/session)
[![Test Coverage](https://img.shields.io/coveralls/expressjs/session/master.svg)](https://coveralls.io/r/expressjs/session?branch=master)

Installing express-session:
```
npm install express-session --save
```

The following sections of this chapter will review how to safely configure a secured session management policy, building step-by-step on the available options of express-session.

The summary of this chapter will feature a complete session management configuration for your convenience.

### Secure your traffic with HTTPs

Routing all of your HTTP traffic through a secured sockets layer such as SSL or TLS prevents attackers from sniffing your data on the wire and makes it harder for them to perform MITM attacks to eavesdrop your traffic.

Cookies may be set on the user browser with a flag to instruct the browser to only transmit cookies when working with HTTPS communication.


```js
var session = require('express-session');

app.use(session({
  cookie: {
    secure: true
  }
}));
```
