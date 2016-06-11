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
