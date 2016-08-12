# Secure Code Guidelines

Secure code guidelines are best practices which are set by organization, individuals, or anyone else to provide a set of standards or rules to follow that enable a person to write secure code. They are different for every programming language, and different guidelines may be set for the same language or platform by different organizations. Adopting a secure code guideline which is in-par with your requirements and company culture ensures quality software, and enhances awareness for security in the team.

T> ## Enforcing Secure Code Guidelines
T>
T> To further strengthen the adoption in your team it is possible to create linting rules and git hooks that ensures source code that is being added to the source code repository is actually following the standards set for a secure code guideline.
T> OWASP maintains a [secure code guideline document](https://www.owasp.org/index.php/OWASP_Secure_Coding_Practices_-_Quick_Reference_Guide) as a reference.

## The Risk

These days attackers aim at application layers as they attempt to exploit vulnerable application code which isn't handling input correctly. Untrusted user input is the first line of defense for an application program code, and mitigating it early in the software development life-cycle is crucial in setting the security boundaries correctly and the foundations for a secure application design.

Failure of securely handling untrusted user input may result in:
* Injection attacks
* Information Disclosure
* Buffer Overflows leading to system compromise or memory leaks

## Input Validation

A program performs input validation to ensure that the received data structure is valid, and as-expected for further handling and manipulation. Untrusted data, such as that which is originating from user input, may contain malicious or invalid data which can lead the program to perform unwanted tasks or cause side-effects.

Due to JavaScript's loosely typed nature, it is required to follow input validation in particular order for safety:
1. Existence - Whether the input data exists.
2. Length - When length matters, check that input data is constraint to a specific length or expected size.
3. Type - Confirming that a received user data matches an expected type. Ideally, where strict type checking is possible, such as with [TypeScript](https://www.typescriptlang.org), this is the preferred method. Otherwise, either basic language types or when expecting all numerics, or all characters, it is best to at least match the expected data.
4. Range - Where the range of values is constraint by your application logic, it is best to confirm that received data indeed matches the range.
5. Blacklisting and Whitelisting - Blacklisting is often less advised due to the fact that it is based on a perceived knowledge of vulnerabilities that the user expects, yet often times it is circumvented using new attacks. Whitelisting is advised as it matches only an expected user input.

I> NodeJS regular expressions are a big no-no due to the horrible reDOS attacks that can bring down a server. With NodeJS being single threaded in nature this becomes super critical and must be carefully observed.

Often, programmers tend to write their own Regular Expressions to validate input, for example, testing whether a received data input matches an e-mail address, a URL address and so on. While regex seem like an easy and natural solution for validating input, if not done correctly, they can be abused using attack vectors like reDOS.

The ideal solution for validating user input is to use one of the following libraries which are constantly tested for security:
* npm's Validator - provides validation and sanitization capabilities
* OWASP's EASPIJS - OWASP's own implementation of that provides both input validation as well as output encoding capabilities.

### Using Validator.js

[Validator.js](https://github.com/chriso/validator.js) is a well tested JavaScript library, that can be utilized both in the server-side as well as the client-side, for validating string data.

[![NPM Version](http://img.shields.io/npm/v/validator.svg)](https://npmjs.org/package/validator)
[![NPM Downloads](http://img.shields.io/npm/dm/validator.svg)](https://npmjs.org/package/validator)
[![Build status](http://img.shields.io/travis/chriso/validator.js.svg)](https://travis-ci.org/chriso/validator.js)
[![Coveralls Status](http://img.shields.io/coveralls/chriso/validator.js/master.svg)]([https://coveralls.io/r/chriso/validator.js)

Validating e-mail addresses:
```js
var validator = require('validator');
var isValidEmail = validator.isEmail('foo@bar.com');
```
