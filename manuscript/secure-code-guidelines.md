# Secure Code Guidelines

Secure code guidelines are best practices which are set by organization, individuals, or anyone else to provide a set of standards or rules to follow that enable a person to write secure code. They are different for every programming language, and different guidelines may be set for the same language or platform by different organizations. Adopting a secure code guideline which is in-par with your requirements and company culture ensures quality software, and enhances awareness for security in the team.

T> ## Enforcing Secure Code Guidelines
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

I> Node.js regular expressions are a big no-no due to the horrible ReDoS attacks that can bring down a server. With Node.js being single threaded in nature this becomes super critical and must be carefully observed.

Often, programmers tend to write their own Regular Expressions to validate input, for example, testing whether a received data input matches an e-mail address, a URL address and so on. While regex seem like an easy and natural solution for validating input, if not done correctly, they can be abused using attack vectors like ReDoS.

The ideal solution for validating user input is to use one of the following libraries which are constantly tested for security:

* npm's Validator - provides validation and sanitization capabilities
* OWASP's EASPIJS - OWASP's own implementation of that provides both input validation as well as output encoding capabilities.

### Using Validator.js

[Validator.js](https://github.com/chriso/validator.js) is a well tested JavaScript library, that can be utilized both in the server-side as well as the client-side, for validating string data.

Validating e-mail addresses:

```js
var validator = require('validator');
var isValidEmail = validator.isEmail('foo@bar.com');
```

## Output Encoding

Output Encoding is a mechanism that is used at the presentation layer, where data that is passed from the server-side to a view, such as a web browser, which should be encoded or sanitized from malicious payloads which seek to exploit vulnerabilities in the presentation layer engine.

Implementing output encoding mitigates attacks such as Cross Site Scripting (XSS) because such malicious data is being encoded when it is output by the application to the presentation layer, hence circumventing any attempt to trick, or trigger an incorrect execution that is not a simple string representation of the data.

T> ## Terminology
T> Output Encoding is often referred to as Output Escaping, Output Handling.
T> Often times another term is associated with output encoding - Canonicalization, which means to convert the untrusted data input into an expected representation in the correct context. For example, a given user input of `<script>alert()</script>` will be canonicalized to `&lt;script&gt;alert();&lt;/script&gt;`

Context is the most important thing about getting output encoding right. It is crucial to apply the type of encoding data for output based on the correct context of the presentation layer. When output is used in an HTML context, the encoding needs to apply HTML entities encoding, where-as when the output is used in a JavaScript context, then another type of encoding needs to happen to properly escape JavaScript code so it is not executed. Other output contexts to name a few are URLs, SQL, or system command calls.

### Using ESAPI for Output Encoding

[Node ESAPI](https://github.com/ESAPI/node-esapi) is OWASP's Enterprise Security API ported to Node.js.

The Node ESAPI project provides the functionality of encoding output for proper contexts, and it features both a functional way of using it like other npm packages, as well as integration with ExpressJS middleware layer.

Encoding output in the context of HTML:

```js
var esapi = require('node-esapi');
var esapiEncoder = esapi.encoder();

var htmlOutput = esapiEncoder.encodeForHTML('<div> Hello World! <script type="javascript"> alert("Got you!") </script> </div>');
```

The result of `htmlOutput` will be properly encoded to escape the malicious script tags:

```html
&lt;div&gt; Hello World&#x21; &lt;script type&#x3d;&quot;javascript&quot;&gt; alert&#x28;&quot;Got you&#x21;&quot;&#x29; &lt;&#x2f;script&gt; &lt;&#x2f;div&gt;
```

ESAPI provides the functionality for the following output encoding contexts:

* HTML - encodeForHTML
* CSS - encodeForCSS
* JavaScript - encodeForJS
* URL - encodeForURL
* HTML Attributes - encodeForHTMLAttribute
* Base64 - encodeForBase64

### Output Encoding Libraries

Except from OWASP's ESAPI project there are other libraries that can be utilized for output encoding in Node.js server-side.
As we learned about encoding, it is very important to use libraries to encode their dedicated context only. For example, using the encode-html library to only encode HTML-context text, and nothing else (not JavaScript, or CSS).

#### HTML Encoding

[escape-html](https://www.npmjs.com/package/escape-html) is a very popular and mature library that can be used on the server-side coupled with template engines or views in order to safely encode HTML output sent to the browser.

After installing the library, it only exports a single function and that is `escape`.

```js
var escape = require('escape-html');
var encodedHTML = escape('<p style="color: red;"> Hello World! <p>');
```

The `encodedHTML` value will be a valid encoded HTML entities:

```html
&lt;p style=&quot;color: red;&quot;&gt; Hello World! &lt;p&gt;
```

#### CSS Encoding

[cssesc](https://github.com/mathiasbynens/cssesc) is a library that serves both Node.JS and the browsers for escaping and optimizing CSS outupt.
It has a slimmed down version specifically for Node.JS that is called [CSS.escape](https://github.com/mathiasbynens/CSS.escape).

To install both of them (not actually required):

```bash
npm install cssesc
```

*cssesc* API exposes a function that takes an input value to escape and a second argument for specifying options.

```js
var cssesc = require('cssesc');
var encodedCSS = cssesc('Node.js security © 2016');
```

The special copyright character will be encoded properly to be used in a valid CSS file:

```
Node.js security \A9  2016
```

#### JavaScript Encoding

[js-string-escape](https://www.npmjs.com/package/js-string-escape) is another popular library which is used to encode text for a JavaScript specific context.

```js
var jsescape = require('js-string-escape');
var encodedJS = jsescape('alert("test")'));
```

A valid JavaScript encoded version of the alert text will be properly escaped as seen below. It isn't however JSON-compliant as can be seen:

```
alert(\"test\")
```

## Regular Expressions

The use of Regular Expressions (RegEx) is quite common among software engineers and DevOps or IT roles where they specify a string pattern to match a specific string in a text. This can be used to perform wild-card fuzzy search to match and test occurrences of strings.

Often, programmers will use RegEx to validate that an input received from a user conforms to an expected condition. To list several examples:

1. Testing that a user's provided e-mail address is valid:

 ```js
 var testEmail = /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))$/.exec('john@example.com');
 ```

2. Testing that a user's provided input is a valid ASCII alphanumeric text:

 ```js
 var testAlphanumeric = /^[a-zA-Z0-9]*$/.exec('abc123');
 ```

The risk that is inherent with the use of Regular Expressions is the computational resources that require to parse text and match a given pattern. A flawed Regular Expression pattern can be attacked in a manner where a provided user input for text to match will require an outstanding amount of CPU cycles to process the RegEx execution. Such an attack will render the application unresponsive, and thus is referred to as a ReDoS - Regular Expression Denial of Service.

A vulnerable Regular Expression is known as one which applies repetition to a repeating capturing group, and where the string to match is composed of a suffix of a valid matching pattern plus characters that aren't matching the capturing group. Reviewing this statement with an example makes things easier. Consider the following regular expression:

```js
var badRegex = /^((abc)*)+$/;
```

The above regular expression attempts to find multiple occurrences of the string "abc", so that the following text snippets would match this regex:

* abc
* abcabc
* abcabcabc

The following text snippets which this regex attempts to match will fail:

* abca
* abc abc

To exploit this vulnerable regular expression an attacker can craft a matching text which is composed first of the suffix from a valid matching pattern, which means that "abc" is a valid pattern so it will begin with that. Following it, a char that begins the new pattern but isn't necessarily matching it - "a". Thus, a maliciously crafted regular expression is "abca". Almost. That's the idea, but that string is very small and the regular expression expansion that happens for every possibility is very small so this regular expression execution will finish very quickly.

Getting the CPU to work hard requires a longer string with more occurrences of the base capturing group "abc". An illustrative example is:

```
abc abc abc a
```

Thus "abc" is repeating and then ending with the char "a" which begins a new capturing group. However that example string is very small too and any modern CPU will quickly process through that as well. How about if a longer matching text is being evaluated?

Try the following:

```js
var re = /^((abc)*)+$/;
console.log(re.exec('abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabca'));
```

Hopefully this did not run on a production server otherwise Node.js would've taken it's time to work through that. On my local development machine it actually took approximately 40 seconds as can be seen:

```bash
$ time node re.js
null
node re.js  41.88s user 0.00s system 99% cpu 41.883 total
```

There are many variations to a vulnerable regular expression, some examples taken from [OWASP](https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS), and [Wikipedia's ReDoS](https://en.wikipedia.org/wiki/ReDoS) pages are:

* (a|aa)+
* ([a-zA-Z]+)*

T> ## Hint
T> Try exploiting the above two examples by matching them on a text of many a's with an ending ! char. Also, the first example of an e-mail matching regular expression looks suspecious too.

### Safe Regular Expressions

There is no magic to apply on regular expressions to make them safe, but rather the secret lies in crafting a correct, performant and safe regular expression pattern. Software engineers should pay attention for increased security implications when creating regular expressions.

Taking the above example of `/^((abc)*)+$/` is simply a human error in writing a pattern, even though it works it's not safe to use. The same regular expression match would also work if the following pattern was used `/^(abc)*$/`, which is safe as it is not repeating a more complex sub-expression.

T> ## OWASP Validated RegEx
T> OWASP's website provides a short list of common [validated regular expressions](https://www.owasp.org/index.php/OWASP_Validation_Regex_Repository) which are safe to use as well as links to other useful RegEx resources.

#### Validator.js

[validator.js](https://github.com/chriso/validator.js) is the go-to library for validating user input. It is mature, well tested, and constantly being attacked with multiple attack vectors with an attempt to find flaws and fix them.

![](images/validatorjs-badges.png)

validator.js is suitable for both frontend JavaScript as well as Node.js server-side backend. Except from validating input, it also provides sanitization functions for specific input types and expected output.

Installing validator.js for Node.js:

```bash
npm install validator
```

Complete documentation for all available validation and sanitization functions is available in the project's README page on GitHub: [https://github.com/chriso/validator.js](https://github.com/chriso/validator.js).

validator.js only accepts strings as input and will otherwise throw an error. An example of validating that a user input is an expected e-mail address:

```js
var validator = require('validator');
console.log(validator.isEmail('liran.tal@gmail.com'));
```


#### Safe-RegEx

[safe-regex](https://github.com/substack/safe-regex) is a library that can be used for both Node.js as well as frontend browsers to test whether a given regular expression pattern is potentially dangerous. The library hasn't been updated in a while, though it does check the very simple rule of repetitions of sub-expressions which is the primary rule for avoiding vulnerable regular expressions.

It is interesting to test the aforementioned e-mail validation regex that was mentioned in an example.

To begin with installing the library locally:

```bash
npm install safe-regex
```

And then testing a regex pattern:

```js
var saferegex = require('safe-regex');
var emailRegex = /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))$/;

console.log(saferegex(emailRegex));
```

The console output would yield `false` as indeed this example of an e-mail validation rule is vulnerable to ReDoS attacks.

#### RegEx DoS

[RegEx-Dos](https://github.com/jagracey/RegEx-DoS) is a command line tool that aids in searching for vulnerable regular expressions by scanning JavaScript files contents and testing any regular expression patterns with the [safe-regex] library.

It is a handy tool to add to any project on the DevOps pipeline or the build chain to confirm that no vulnerabilities are introduced, and if they do the fix is quick as they are found during the build stage.

## Strict Mode and Eval

Strict mode was introduced in [ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/#sec-10.1.1) to enable a restricted version of JavaScript for enhanced security, and error management. It disables some language features which if used, may lead to confusion, inconsistency or security problems.

Some of them are:

* `eval` and `with` are disabled from being referred to as identifiers of any sort.
* Variables must be explicitly declared
* Property names can't be duplicated in an object definition, or in parameters passed to functions.
* Unwanted behavior will now throw errors

For ECMAScript 6, enabling strict mode has some more effect on the language syntax:

* No values can be set on primitive variables like Boolean, String, or Numbers.
* Octal values can be assigned to variables only using a "0o" syntax.

It is probable that you have witnessed the strict mode invocation as it became quite the de-facto for writing securely in JavaScript. It is recognized by programs that start with the following line:

```js
'use script';
```

It affects the entire script, or it can affect only a portion of it, such as a specific function if applied inside.

### Eval

The `eval()` function is perhaps of the most frowned upon JavaScript pieces from a security perspective. It parses a JavaScript string as text, and executes it as if it were a JavaScript code. Mixing that with untrusted user input that might find it's way to `eval()` is a recipe for disaster that can end up with server compromise.

T> The use of `eval()` isn't specific to JavaScript, but is also found in other programming languages such as PHP, Perl, and others.

While there is no inherent security flaw regarding the use of `eval()` in your code, it is often perceived as bad practice to make use of it. Cases where you might need to use eval are when it is required to dynamically run JavaScript code, such that is somehow generated, put together, and not owned by yourself. Otherwise, there's always the option to refactor the code and avoid using eval altogether.

T> ## Who said it's evil?
T> The phrase "eval() is evil" is credited to [Douglas Crockford](https://en.wikipedia.org/wiki/Douglas_Crockford), an active member in the evolution of the JavaScript language, and evangelist of the JSON standard.

Surprisingly enough, eval has friends: `setTimeout()` and `setInterval()` are also regarded as bad coding practices for the same reason that they both accept string as input, which they parse and evaluate for execution.

## Cryptographic Practices

The use of cryptography functions is quite common when building web applications, and is often presenting the use case of maintaining a database of users and their passwords. Encrypting a user's password is another layer of defense to protect against server breach or data leakage through SQL Injection or other attacks.

Hash functions are commonly used for one-way cryptography, such that is used to protect a user's password.

### Risk

There are many cryptographic hashing functions and algorithms which are available to use, but choosing the correct one is important as a best practice to make sure that encrypted data stays confidential even if it ended up as public content.

[MD5](http://en.wikipedia.org/wiki/MD5) and [SHA](http://en.wikipedia.org/wiki/Secure_Hash_Algorithm) are examples of commonly known cryptographic functions which are popular amongst developers to employ, yet they are quite insecure for encrypting data that is meant to remain confidential. The reasons behind this statement are:

1. These cryptographic hash functions are unsalted, which means they do not take into consideration per hash value randomness and uniqueness, therefore they are vulnerable to brute force attacks using pre-built dictionaries.

2. MD5 and SHA family of hash functions are very fast in computing a hash, which may seems as a performance feature, but on the other hand they also make it very easy and accessible for an attacker to enumerate such hash quite quickly.

T> ## Rainbow Tables
T> [rainbow tables](http://en.wikipedia.org/wiki/Rainbow_table) are pre-computed hash dictionaries for a variety of password policies, for example an alphanumeric 8 limit chars.

Writing up your own hash function is a bad practice, simply because there is so much science into a properly working secure hash and an individual can easily get it wrong. Further read on this topic is available on [OWASP's Cryptographic Storage Cheat Sheet](https://www.owasp.org/index.php/Cryptographic_Storage_Cheat_Sheet).

### The Solution of Secure Hash Functions

To meet security standards we combine a proper hash function with an adequate algorithm which results in a secure hash function. What makes such a hash secure is that it employs the use of salts and are inherently slower so that brute force attacks or dictionary lookups are not worth the effort. Other characteristics makes them secure such as iterating the hash millions of times.

[bcrypt](https://en.wikipedia.org/wiki/Bcrypt) is a commonly accepted secure hash function which employs the Blowfish cipher. When using bcrypt with Node.js, one should consider the use of native bcrypt libraries which offer superior performance verses the JavaScript implementation which are slower, yet are cross-platform compatible.

I> ## JavaScript bcrypt implementations
I> Other options to consider for a JavaScript implementation are [bcrypt.js](https://github.com/dcodeIO/bcrypt.js/), and [twin-bcrypt](https://github.com/fpirsch/twin-bcrypt).

Using Node.js native bcrypt we will first install it via npm:

```bash
npm install bcrypt
```

bcrypt provides the following primary methods which work asynchronously:

* `bcrypt.genSalt(saltRounds, callback(err, salt))` - `genSalt` generates a salt, and can iterate `saltRounds` number of times to further increase salt randomness, taking a `callback` function with an error object as the first argument, or the generated salt in the 2nd argument.

* `bcrypt.hash(password, salt, callback(err, hash))` - `hash` generates a hash from the an input `password` argument using a `salt`. If `salt` is a number, it uses it as a rounds count to create a salt on it's own. Once a hash is generated, it calls a `callback` function with an error object as the first argument, or the generated hash in the 2nd argument.

* `bcrypt.compare(password, hashedPassword, callback(err, res))` - `compare` will compare a given password with a given hash and will call a callback function with an error object as the first argument, or a boolean `res` object if there's a match.

When hashing passwords, it is important to understand the cost of the salt rounds count. The following table provides a reference based on my quad core i5-3470 CPU @ 3.20GHz:

| salt rounds | password generation time |
| ----------- | ------------------------ |
| 2           | 2ms                      |
| 8           | 17ms                     |
| 10          | 68ms                     |
| 11          | 132ms                    |
| 12          | 263ms                    |
| 13          | 526ms                    |
| 14          | 1s                       |
| 15          | 2s                       |
| 17          | 8s                       |
| 19          | 33s                      |
| 20          | 1m                       |

When choosing a salt round count one must take into account that CPU power increases in a very fast pace (see [Moore's law](https://en.wikipedia.org/wiki/Moore%27s_law)), and at the end of the day CPU power can be bought so it ends up to be a matter of how much money to invest in attempting to crack a password (imagine a person buying a cluster of CPUs from a cloud service like Amazon or Google just to crack a password).

For this reason, the number of rounds count will change as hardware will become more powerful. A general guideline would be to set a round count to anything between 0.2 seconds to 1 second for a non mission critical web application, depending on your personal paranoia level (PPL).

Creating a hash for a password with bcrypt:

```js
var bcrypt = require('bcrypt');

bcrypt.hash("hacktheplanet", 13, function(err, hash) {
  console.log(hash);
});
```

To authenticate the user, it is required to simply compare the original password with it's previously computed hash:

```js
var bcrypt = require('bcrypt');

bcrypt.compare("hacktheplanet", hash, function(err, res) {
  if (!!res) {
    console.log('password match!');
  } else {
    console.log('wrong password');
  }
});
```

bcrypt features a synchronous set of functions for the same aforementioned methods: `genSaltSync`, `hashSync`, and `compareSync`. some input/output limitations with bcrypt are truncating after 72 chars, and allows an input password of up to 51 chars.

T> ## Available Secure Hash Functions
T> There are other secure hash functions than bcrypt: Argon2 which is the *new kid on the block*, scrypt, and last as well as least preferred PBKDF2.

## User Process Privileges

Running web servers which serve requests from an untrusted and open public medium brings with it an inherent risk where malicious attempts will try to compromise the underlying server and operating system through vulnerabilities in the web server.

Web servers have no reason to operate with a super-user privilege level, except for being able to bind and listen for incoming requests on port 80 or 443 which are allowed only to the super-user in Linux and UNIX variants (non super-users may bind to ports larger than 1024 on those operation systems).

To mitigate this issue, production environments often feature a more secured medium to handle requests and proxy them to the web server that binds on another port using a regular system user.

Such medium may vary in purpose and can be identified usually as one of the following, but not limited to:

1. A Reverse Proxy
2. A Load Balancer

Using a Load Balancer for example, it will most probably terminate the SSL connection to offload this heavy CPU work from web servers, and expose a routable IP and host to the public to access it over a secure HTTP channel. All incoming requests are routed to Node.js web application servers that are not directly exposed outside. 

These Node.js servers would ideally run without a super-user owner, which is why many Node.js frameworks and server setup guides will feature a server that listens on high ports such as 3000, 4000, 5000, 8888, and 9000. This is so that the server can be executed without requiring a super-user privilege. If the Node.js server is exploited then it doesn't compromise the entire server just from it's own share of OS resources, unless a privilege escalation vulnerability exists.

{pagebreak}

# Summary 

Keeping a security-oriented state of mind while writing code and setting up environments is an essential layer of security. Secure code guidelines may vary in different organizations depending on culture, technology stack and other considerations but they should be followed nonetheless.

While not presuming to be a complete list, in this chapter we reviewed the following topics for security best practices and guidelines:

* Input validation
* Output encoding
* Regular Expressions
* JavaScript's Strict Mode
* Cryptographic Practices
* User Process Privileges
