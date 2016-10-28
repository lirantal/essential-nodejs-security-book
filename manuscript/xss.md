# Cross-Site Scripting (XSS)

A Cross-Site Scripting (XSS) attack is characterized by an attacker's ability to inject to a web application, scripts of any kind, such as Flash, HTML, or JavaScript, that are intended to run and render on the application serving the page. The web application unintentionally serves the script code which is executed by the browser and hence makes the user vulnerable to data theft and any privileges level which the script is allowed.

The source of an XSS vulnerability lies in a web application that allows malicious code to be injected and evaluated as part of the web page being served to the user, and then the same malicious code is executed by the browser due to the web application inability to filter and sanitize the output.

To explore an example of a simple use case - A web page which reads the user's name from the query parameter http://example.com/profile?name=John, and then it uses this parameter to display the user's name on a profile page:

```html
<div>
  <h2>{{name}}</h2>
</div>
```

What would happen if someone were to replace the string *John* with JavaScript code?

```html
http://example.com/profile?name=<script>alert("xss")</script>
```

If no string escaping is performed on the *name* parameter at the output level, or at least some sanitization on the data that is expected for the *name* parameter to be valid, then the rendered page will actually have the JavaScript code printed out to the user and the browser which renders this script will display an alert dialog box:

```html
<div>
  <h2><script>alert("xss")</script></h2>
</div>
```

{pagebreak}

## The Risk

XSS vulnerabilities can be classified in one of the following categories:

* Stored/Persistent XSS - As it name implies, a stored XSS attack is when the malicious XSS code is injected to the web application and is stored on the persistent storage which the application implements. For example, if the web application would allow comments, and the comments input is not validated or sanitized then an attacker could inject malicious XSS code as part of the comment. Due to the comment being stored in the web application, when the page renders the comment view for any user it will also expose the user to this attack.


* Reflected XSS - This type of XSS attack has the same result for the end user, but is less severe from a stored XSS because the web application is not exposing all users alike to the malicious code but instead, an attacker is able to craft a malicious link that when the user is tricked into viewing it then the request injects the malicious code into the web application and then renders on the user's browser.

    For example, imagine a search query being made:
    http://example.com/search?movieName=Inception where a common web application will make use of the *movieName* parameter to inform the user what he searched for. If the web application is insecure a reflected XSS attack can occur with an attacker being able to replace the value for the *movieName* parameter with a malicious JavaScript executable code.


* DOM-based XSS - The nature of this XSS attack lies in the web application code making use of DOM methods which rely on insecure user input. Browsers provide the most commonly used *document* object which allows to interact with the web page structure and the current web request that was made. Vulnerable properties of the *document* object are *document.location* or *document.documentURI* to name a few. If a web application uses one of these properties insecurely to parse data from the request being made and then use it in the web page then an attacker is able to alter the request just like with a reflected XSS attack and thus affect the DOM structure and expose the user's browser to execute the malicious code.


Briefly reviewing the sources of untrusted input data which may be vulnerable to XSS attacks:

* Query string and parameters - these are the most common input injections and include any *GET* parameters, the URL itself or pieces of it, and general *POST* data or other HTML methods.


* Cookies - even cookies may contain data which an attacker was able to somehow inject malicious code into and should be treated with care.

### Variations of XSS syntax

JavaScript being the most widely used language for malicious code, it can be represented and transmitted in ways other than the common `<script>` tags.

For example, XSS using HTML event attributes. HTML supports DOM events to be assigned as an attribute to HTML entities. When assigned, the events allow to execute JavaScript code which doesn't need to be wrapped inside `<script> ... </script>` tags:

```html
<button onClick="alert('xss')">Submit</button>
```

The risk presented with this attack is that web applications that attempt to blacklist or filter so-called risky HTML tags like the script tags will fail in this case where the attacker is able to inject JavaScript code to the page by including it as part of the allowed DOM events.

More resources to get acquainted with XSS related injection:

* **XSS syntax variations** - OWASP Wiki includes a comprehensive and very detailed [XSS Filter Evasion Cheat Sheet](https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet) which features the many variations of possible injections that can be employed by an attacker to bypass your protection controls and succeed with an XSS attack.

* **HTML5 Security** - Due to the new HTML5 specification, browsers are adopting new directives, attributes, elements and this introduces new vectors of attack, some of which are related to XSS. [html5sec](https://html5sec.org/) is a good reference website to keep up to date with such vulnerabilities related to insecure adoption of HTML5 features.

## The Solution

XSS vulnerabilities expose and attack the end user by exploiting browser execution of unintentional injected code into the page. As such, the path for defending against XSS attacks lies on the client side when outputting potentially dangerous user data input.

There are two primary methods to prevent XSS attacks:

* **Filtering** - by filtering, or sanitizing the untrusted data that originated from the user's input the end result is that the data is modified and removed of the original text that it contained. If for example a user on a blog wanted to comment and give an example of the use of `<script>` tags then filtering based on a blacklist/whitelist  will remove any offending tags such as `<script>`, even if the user did not intend to execute this code on the browser maliciously but rather just to print it and share the text on the website.

 Pitfalls of filtering is that it relies on a blacklist or a whitelist which could be subject to frequent changes, hence it requires maintenance and error-prone, and it usually requires complex string manipulation logic that is often based on regular expressions which by themselves can become a security threat or simply not being written correctly to address future changes and string alterations that the programmer did not expect thus could be bypassed.

* **Escaping/Encoding** - Unlike filtering, encoding the untrusted data preserves all the input which the user supplied by escaping potentially malicious characters with their display character encoding. For example, if the input from the user is expected to be an HTML text and it is also treated as such, then in cases where the input is  `<script>alert('xss')</script>` then it is possible to encode the `<` symbol to its HTML entity representation which is `&lt;`. This character entity has also a number associated with, so the `<` symbol could also be represented with the string `&#60;` which will result in the same encoding behavior. Browsers know how to parse these entities and display them correctly.

 The important nuance of encoding data is to encode it with the correct context of where it will be used. JSON, HTML, and CSS are all different in their encoding and one does not match the other so based on where the input is planned to be utilized the correct form of encoding should be used.

In summary, filtering is not the ideal solution to prevent XSS attacks. Validation and filtering of the data should happen on the user's data input and not on the output processing. Encoding the outputted data is on the other hand a better path to take to prevent XSS attacks as it renders any data as plain text which the browser won't be tricked into executing.

I> ## XSS attacks evolve
I> Specifications, browsers, and the web in it's entirety constantly changes and introduces new technologies that web applications adopt and security needs to be adopted for as well. As such, XSS attacks have a great variety of attack vectors to exploit and increasingly harder to defend from and patch.

### Encoding libraries: node-esapi

OWASP has their own [ESAPI](https://www.owasp.org/index.php/ESAPI) project which aims to provide security relates tools, libraries and APIs that developers can adopt in order to provide essential security. This project has been ported to a Node.js library that is available as an npm package and is called *node-esapi*.

[node-esapi](https://github.com/ESAPI/node-esapi) can be installed as any other npm package, and also update the *package.json* file with its dependency:

```
npm install node-esapi --save
```

Once installed, the library provides encoding functions for each type of data that should be encoded, so that the following general guideline should be applied:

* Use JavaScript encoding when untrusted input data is to be placed within the context of an executable JavaScript code. For example, a string of input from the user is expected to be used in a JavaScript source code such as `<script>showErrorMessage(userInput)</script>`.

* Use HTML encoding when untrusted input data is to placed within HTML markup. For example if the data is to be placed inside `<div>` tags, `<span>` tags, etc.

To encode HTML:

```js
var esapi = require('node-esapi');
var esapiEncoder = esapi.encoder();

app.get('/', function(req, res, next) {

  // example for unsafe user input intended for embedding in HTML markup
  // req.query.userinput may include the string:
  // <div><span>Example</span><script>alert('xss')</script></div>
  var userInputExample = req.query.userinput;

  // encodedInput is now safe to output in an HTML context of the web page
  var encodedInput = esapiEncoder.encodeForHTML(userInputExample);
});
```

T> ## Encoding for other data representations.
T> node-esapi also includes encoders for CSS, URL, HTML Attributes, and for Base64 representation of data.

### Encoding libraries: xss-filters

From the home of Yahoo!, [xss-filters](https://github.com/yahoo/xss-filters) is another XSS encoding library. It is designed to follow HTML5 specification for implementation of XSS filters, and is constantly reviewed by security researchers from Yahoo!.

It is important to notice that *xss-filters* are intended to be used only inside an HTML markup context. You should not use it for any untrusted user input in other contexts like JavaScript or CSS code, or other specific objects like `<svg>`, `<object>`, or `<embed>` tags.

T> ## Yahoo! is quite active in the Node.js community
T> Did you know that Yahoo! is an active player in the Node.js community? They have contributed to the npm repository about a hundred of packages altogether with general JavaScript, and frontend libraries, amongst Node.js.

Installing *xss-filters*:

```bash
npm install xss-filters --save
```

Using the library to encode:

```js
var xssFilters = require('xss-filters');

app.get('/', function(req, res, next) {
  var userInput = req.query.userinput;
  var safeUserInput = xssFilters.inHTMLData(userInput);

  // do something with safeUserInput that is now encoded and safe to print
  // out in an HTML context
});
```

Besides *inHTMLData* there are other APIs that exist to handle encoding untrusted data in other context:

* HTML comments *inHTMLComment* - to encode data in HTML comment's such as `<!-- {{comment}} -->`


* HTML attributes - to encode data in HTML attributes it is required to make use of the appropriate quoting notation used in the attributes context.

With regards to HTML attributes, when using a single quote notation in attributes then use the *inSingleQuoteAttr* method:

JavaScript:

```js
var safeUserInput = xssFilters.inSingleQuotedAttr(userInput);
```

HTML:

```html
<input value='{{safeUserInput}}'/>
```

When using double quotes notation in attributes then use the *inDoubleQuotedAttr* method:

JavaScript:

```js
var safeUserInput = xssFilters.inDoubleQuotedAttr(userInput);
```

HTML:

```html
<input value="{{safeUserInput}}"/>
```

When not using any type quotation as attributes in HTML elements, for example to specify attribute keywords `hidden` which is applied to an HTML element and makes it invisible then use the *inUnQuotedAttr* method:

JavaScript:

```js
var safeUserInput = xssFilters.inUnQuotedAttr(userInput);
```

HTML:

```html
<input name="csrfToken" value="{{csrfValue}}" {{safeUserInput}}/>
```

To further fine-tune the context of the untrusted input from the user, such as whether it is originated from a URI input then it is possible to use a specific method such as:

```js
var userURIInput = xssFilters.uriInHTMLData();
var userURIPathInput = xssFilters.uriPathInHTMLData();
var userURIGragmentInput = xssFilters.uriFragmentInHTMLData();
```

{pagebreak}

## Summary

OWASP ranks Cross Site Scripting (XSS) in the 3rd position of the [Top 10 vulnerabilities and attack vectors](https://www.owasp.org/index.php/Top10#OWASP_Top_10_for_2013). As such, our awareness of security concerns should be high for attacks which are very common and easy to exploit.

To prevent XSS vulnerabilities, we learned about one of the basic mitigation techniques which is to encode or escape the output data so that malicious user input would not compromise the user's web browser by interpreting a maliciously injected JavaScript code.

The libraries we reviewed to mitigate XSS are OWASP's own node-esapi and Yahoo!'s xss-filters.
