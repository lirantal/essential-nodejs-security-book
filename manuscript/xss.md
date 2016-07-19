# Cross-Site Scripting (XSS)

A Cross-Site Scripting (XSS) attack is characterized by an attacker's ability to inject to a web application, scripts of any kind, such as Flash, HTML, or JavaScript, that are intended to run and render on the application serving the page. The web application unintentionally serves the script code which is executed by the browser and hence makes the user vulnerable to data theft and any privileges level which the script is allowed.

The source of an XSS vulnerability lies in a web application that allows malicious code to be injected and evaluated as part of the web page being served to the user, and then the same malicious code is executed by the browser due to the web application inability to filter and sanitize the output.

To explore an example of a simple use case - A web page which reads the user's name from the query parameter http://example.com/profile?name=John, and then it uses this parameter to display the user's name on a profile page:
```html
<div>
  <h2>{{name}}</h2>
</div>
```
What would happen if someone were to replace the string *John* with JavaScript code? `http://example.com/profile?name=<script>alert("xss")</script>`.
If no string escaping is performed on the *name* parameter at the output level, or at least some sanitization on the data that is expected for the *name* parameter to be valid, then the rendered page will actually have the JavaScript code printed out to the user and the browser which renders this script will display an alert dialog box:
```html
<div>
  <h2><script>alert("xss")</script></h2>
</div>
```

## The Risk

XSS vulnerabilities can be classified in one of the following categories:
* Stored/Persistent XSS - As it name implies, a stored XSS attack is when the malicious XSS code is injected to the web application and is stored on the persistent storage which the application implements. For example, if the web application would allow comments, and the comments input is not validated or sanitized then an attacker could inject malicious XSS code as part of the comment. Due to the comment being stored in the web application, when the page renders the comment view for any user it will also expose the user to this attack.
* Reflected XSS - This type of XSS attack has the same result for the end user, but is less severe from a stored XSS because the web application is not exposing all users alike to the malicious code but instead, an attacker is able to craft a malicious link that when the user is tricked into viewing it then the request injects the malicious code into the web application and then renders on the user's browser. For example, imagine a search query being made to the server http://example.com/search?movieName=Inception where a common web application will make use of the *movieName* parameter to inform the user what he searched for. If the web application is insecure a reflected XSS attack can occur with an attacker being able to replace the value for the *movieName* parameter with a malicious JavaScript executable code.
* DOM-based XSS - The nature of this XSS attack lies in the web application code making use of DOM methods which rely on insecure user input. Browsers provide the most commonly used *document* object which allows to interact with the web page structure and the current web request that was made. Vulnerable properties of the *document* object are *document.location* or *document.documentURI* to name a few. If a web application uses one of these properties insecurely to parse data from the request being made and then use it in the web page then an attacker is able to alter the request just like with a reflected XSS attack and thus affect the DOM structure and expose the user's browser to execute the malicious code.

Briefly reviewing the sources of untrusted input data which may be vulnerable to XSS attacks:
* Query string and parameters - these are the most common input injections and include any *GET* parameters, the URL itself or pieces of it, and general *POST* data or other HTML methods.
* Cookies - even cookies may contain data which an attacker was able to somehow inject malicious code into and should be treated with care.

### Variations of XSS syntax

JavaScript being the most widely used language for malicious code, it can be represented and transmitted in ways other than the common `<script>` tags.
For example, XSS using HTML event attributes. HTML supports DOM events to be assigned as an attribute to HTML entities. When assigned, the events allow to execute JavaScript code which doesn't need to be wrapped inside **<script> ... </script>** tags:

```html
<button onClick="alert('xss')">Submit</button>
```

The risk presented with this attack is that web applications that attempt to blacklist or filter so-called risky HTML tags like the script tags will fail in this case where the attacker is able to inject JavaScript code to the page by including it as part of the allowed DOM events.

More resources to get aquainted with XSS related injection:
* **XSS syntax variations** - OWASP Wiki includes a comprehensive and very detailed [XSS Filter Evasion Cheat Sheet](https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet) which features the many variations of possible injections that can be employed by an attacker to bypass your protection controls and succeed with an XSS attack.
* **HTML5 Security** - Due to the new HTML5 specification, browsers are adopting new directives, attributes, elements and this introduces new vectors of attack, some of which are related to XSS. [html5sec](https://html5sec.org/) is a good reference website to keep up to date with such vulnerabilities related to insecure adoption of HTML5 features.
