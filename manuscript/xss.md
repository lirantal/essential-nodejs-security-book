# Cross-Site Scripting (XSS)

A Cross-Site Scripting (XSS) attack is characterized by an attacker's ability to inject to a web application, scripts of any kind, such as Flash, HTML, or JavaScript, that are intended to run and render on the application serving the page. The web application unintentionally serves the script code which is executed by the browser and hence makes the user vulnerable to data theft and any privileges level which the script is allowed.

The source of an XSS vulnerability lies in a web application that allows malicious code to be injected and evaluated as part of the web page being served to the user, and then the same malicious code is executed by the browser due to the web application inability to filter and sanitize the output.

To explore an example of a simple use case - A web page which reads the user's name from the query parameter http://example.com/profile?name=John, and then it uses this parameter to display the user's name on a profile page:
```html
<div>
  <h2>{{name}}</h2>
</div>
```
What would happen if someone were to replace the string *John* with JavaScript code? http://example.com/profile?name=<script>alert("xss")</script>.
If no string escaping is performed on the *name* parameter at the output level, or at least some sanitization on the data that is expected for the *name* parameter to be valid, then the rendered page will actually have the JavaScript code printed out to the user and the browser which renders this script will display an alert dialog box:
```html
<div>
  <h2><script>alert("xss")</script></h2>
</div>
```
