# Injection Flaws

Injection attacks exploit vulnerabilities in systems and applications that fail to validate, escape, and secure their methods of utilizing other sub-systems. Such injection flaws apply to many components, among the most popular are SQL injections, and Operating System injection.

Increased security awareness when developing software is essential to mitigate such attacks. Following best practices and secure code helps mitigate injection vulnerabilities as follows:

* **Validation** - confirm that when passing data to a sub-system it confirms to an expected type or format

* **Escaping or Encoding** - always escape or encode data when passing to a sub-system to ensure it is handled properly

Making use of these practices in each component differs. Taking SQL Injections as an example, an implementation of the Escaping or Encoding rule is implied by the use of Prepared Statements or also known as Parameters Binding technique, which ensures that the at an SQL level, the data is properly escaped and appended to an SQL query.

T> ## Elaborate read
T> More information about this topic can be found on OWASP's [injections flaws](https://www.owasp.org/index.php/Injection_Flaws) section.

## NoSQL Injections

Similar to SQL injections, improper validation or escaping of user manipulated input can lead to dynamic queries that are executed on NoSQL databases.

Due to the different nature of SQL and NoSQL databases, the attack vector isn't necessarily the same. For example, a common user input such as illustrated below will not have an affect on a NoSQL database even if the malicious user input has not been properly sanitized or escaped:

NoSQL query to validate user login credentials:

```js
db.users.findOne({username: username, password: password});
```

Assuming an attacker knows that a valid username exists as "admin", a malicious user input for the username field would be:

```
admin' --
```

The above examples illustrates an attempt to alter the original query the programmer wrote, although this will not have any catastrophic affects on a NoSQL database such as MongoDB. This is because the basic structure of the query language is entirely different.

On the other hand, if this input was to run on an SQL database which doesn't properly validate or escape strings, then the result would be as follows:

```sql
-- Original query in code:
-- SELECT id, user FROM users WHERE username = '$username' AND password = '$password'
--
-- The altered query based on the user input:
SELECT id, user FROM users WHERE username = 'admin' -- AND password = ''
```

### The Risk

ExpressJS by default will not provide a mechanism to access any data sent in a non-GET request, which is an obvious problem when implementing simple things such as login forms which send form data or a JSON POST request. To quote the [official guide](http://expressjs.com/en/api.html) on expressjs.com on this:

> req.body contains key-value pairs of data submitted in the request body. By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser and multer.

This is where the `body-parser` library comes in. It makes it available to parse non-GET query data and it is widely used today in the majority of ExpressJS projects as the standard way of accessing requests body payload. In-fact it is so popular that as of writing this book, the body-parser library has been downloaded for roughly 5 million times just this past month.

body-parser has two main parsing middlewares which are described as follows:

* `bodyParser.json()` - this middleware is designed to parse JSON payload that is sent over an `application/json` content type.

* `bodyParser.urlencoded()` - this middleware is designed to parse form field payloads which are common to HTML page implementations that get sent over an `application/x-www-form-urlencoded` content type.

With either of these parsing methods enabled, the result is that body-parser populates the `req.body` object with property names, based on the payload that got sent on the request.

In the case of the `.json()` method it will further attempt to convert any strings to actual objects that will populate `req.body`.

#### Re-constructing a NoSQL Injection

A typical application will expect to receive the username and password fields either as a normal HTML FORM submit or through an AJAX call where the request sends these fields as a JSON content-type.

In this case, an ExpressJS web application will require the following middlewares:

```js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
```

To authenticate the user, a typical POST login route and matching the request sent from the browser to the database would look similar to the following:

```js
app.post('/login', function(req, res) {
  User.find({ username: req.body.username, password: req.body.password }, function(err, users) {
    res.status(200).send(users);
  });
});
```

In the above code, the `User` model runs a query to to the MongoDB database to match the username and pasword fields. They are populated in the `req.body` object as first citizens JavaScript properties.

If a malicious user would take advantage of this type of authentication matching logic then they can exploit MongoDB's operators to return a valid `users` object. This can be accomplished by sending the following JSON data as the login POST request:

```json
{"username":{"$gt": ""}, "password":{"$gt": ""}}
```

This works because `req.body.username` will be set to the object `{"$gt": ""}` which is a valid MongoDB operator to match any documents where the `username` field is not empty (the `$gt` operator means "greater than").

This can be validated easily with the following curl request:

```bash
curl -X POST -H "Content-Type: application/json" --data '{"username":{"$gt": ""}, "password":{"$gt": ""}}' http://localhost:31337/login
```

#### Threats

Beyond the obvious noSQL injection that can lead to bypassing user authentication, there are severe threats to a MongoDB server such as Denial of Service (DOS) attacks where an attacker would deliberately inject a complicated RegEx or matching statement that will throw MongoDB into CPU resource hogging actions such as full table scans.

Another security threat is related to privacy and data leakage where an attacker can provide a RegEx value that will match many records in order to pull out information from the MongoDB server.

### The Solution

To prevent NoSQL injections it is required to validate the user input or escape it properly. Additionally, some Node.js libraries like [sequelize](http://sequelizejs.com) ORM provide prepared statements for queries.

A very first and basic step is to validate user input, with regards to the following rules to confirm the expected type being received in the request is valid:

1. Validate length and type of the data
2. Validate and sanitize the input to an expected type (for example, type casting)

To mitigate the above NoSQL injection vulnerability a simple fix to our code is needed - casting the username and password fields to a string.

The fix is illustrated in the following code snippet:

```js
app.post('/login', function(req, res) {

  // coerce the req.body properties into strings, resulting in [object object] in case
  // of a converted object instead of a real string
  // another convention is to call the object's .toString();
  User.find({ username: String(req.body.username), password: String(req.body.password) }, function(err, users) {
      res.status(200).send(users);
  });
});
```

If our application expects usernames and passwords to be only strings, then nothing breaks. Yet, let's investigate what happens when we cast the object `{"$gt": ""}` to a string:

```js
console.log(String({"$gt": ""}));
// result is: '[object Object]'
```

In conclusion, there are many ways to validate and confirm the expected input type is being matched so keeping track of how MongoDB queries are run with regards to the input they match against is crucial. One example is the [passport-local](https://github.com/jaredhanson/passport-local) library which completely ignores the request if the data it received is an object.

## NoSQL SSJS Injections

Server-side JavaScript (SSJS) Injection occurs when a server-side component allows the execution of arbitrary JavaScript code in the server context. It may allow this to provide some extended functionality, but nevertheless, this capability opens the door for untrusted input data by the user to be interpreted and executed.
 
Common server-side JavaScript injections can be referred to any use of `eval()`, `setTimeout()`, `setInterval()`, or, `Function()`. All of which, allow parsing arguments which may wrongly originate from a user controlled input data.

MongoDB's Evaluation Query operator, referred to as `$where` allows to match documents when they satisfy a JavaScript expression.

Let's review an example of such query for a MongoDB database:

```
> db.users.find( { $where: function() { return (this.country == 'IL'); }});
```

When executed, MongoDB matches all the user's collection documents where their country field equals to the string 'IL' and will return all those matches.
This can also be shortened and written as follows:

```
> db.users.find( { $where: this.country == 'IL' }});
```

### The Risk

A security vulnerability can be introduced when un-sanitized parameters are passed to the evaluated JavaScript expression for the $where operator.

The following is a very stripped down version of this vulnerability when exploited by an attacker. It demonstrates an ExpressJS application that defined a `/userCountries` GET API which executes a MongoDB injection with a $where operator:  

```
app.get('/userCountries', function(req, res) {

  var country = req.query.country;
  var searchCriteria = "this.country == " + "'" + country + "'";

  users.find({
    $where: searchCriteria
  }).toArray(function(err, response) {

    res.render('users', { users: response });

  });
});
```

The `searchCriteria` variable will build the where expression based on user input, and so the exact MongoDB query that will execute will look as follows:

```
  $where: "this.country == 'IL'" 
```

This query awfully resembles traditional SQL injections, and because the $where operator evaluates JavaScript then such insecure method of combining user input with a MongoDB query may result in the following malicious scenario:

An attacker sends a GET request which satisfies the $where operator by providing text to the boolean expression and also closing it with a single quote. Now, it is possible to terminate this string expression and add any valid JavaScript code. Finally, there's a closing single quote that gets concatenated to the string, so the GET request also adds it.  

```
$ curl "http://localhost:31337/user?country=IL';while(true)\{\};'"
```

The resulting $where operator expression looks as follows:

```
  $where: "this.country == 'IL';while(true){};''" 
```

This valid JavaScript expression is actually triggering a DoS attack on the MongoDB service. While Node.js isn't exploited here and can further serve requests, any additional requests to the Node.js server that require MongoDB will stall. At this point, MongoDB is completely taking up 100% CPU resources in an infinite loop that will end only when watchdogs and timers kick-in. 

### The Solution

In reference to MongoDB itself, the `$where` operator should probably be avoided when possible. The [documentration](https://docs.mongodb.com/manual/reference/operator/query/where/) further elaborates the insecure and inefficient characteristics of the $where operator. It should only be used as a last resort.

Follow these general guidelines to avoid and mitigate NoSQL injection attacks:
 * Sanitizing and validating user input - do not allow user originating input as is. Always validate, and filter to match the allowed and expected data.
 * Prepared statements - familiar from traditional SQL methodologies, secure the data passed to queries through prepared statements. Better alternative to the official MongoDB client are ORM and ODMs that provide out of the box security. For example, [sequelizejs](https://github.com/sequelize/sequelize), or [mongoose](https://github.com/Automattic/mongoose).
 * Don't use insecure JavaScript functions to parse user input, such as: `eval()`, `setTimeout()`, `setInterval()`, and `Function()`.


## OS Command Injection

Care consideration must be given when resorting to the undesired option of executing Operating System (OS) commands to execute a program, or shell script. While there may be valid reasons for doing so in some situations, the potential for a critical security vulnerability is great because of the OS-level context. When this is done incorrectly, it may lead to OS command injection and thus compromising the underlying server OS.

In similar to other injection vulnerabilities, the focus on mitigating this kind of attack is to use a proper string binding with a secure shell execution function call, and apply proper output encoding, which in this case is in the context of an Operating System command shell.

Node.js provides OS command execution using child processes set of functions, and specifically using the `child_process` module.
The `child_process.exec()` function allows to spawn a shell and then execute a given command within that shell context. Taking into account the following example:

```js
var child_process = require('child_process');

function listPath(directory) {
  var cmd = "ls -alh";
  child_process.exec(cmd + ' ' + directory, function(err, data) {
    console.log(data);
  });
}
```

In the above code snippet, the `listPath` function takes a directory reference as a parameter and appends it to the command that gets executed in a shell. The `directory` parameter to the function should be regarded as an untrusted source, such as one that originates from untrusted user input. What would happen if that parameter will be set to `; cat /etc/passwd` ?
Similar to how SQL injection attacks work, the special semi-colon char will end one command statement, and begin a new one, leading to an execution as follows:

```bash
$ ls -alh
$ cat /etc/passwd
```

Due to this vulnerability, the `child_process.exec()` function should be avoided entirely at all circumstances, and instead one should make use of `child_process.execFile()`, which executes a single and bound command, and allows passing it any number of arguments that cannot be altered and spawned as individual commands.

Thus, a safe command execution methodology:

```js
var child_process = require('child_process');

function listPath(directory) {
  var cmd = "ls";
  var cmdParams = ['ls'];
  cmdParams.push(directory);
  child_process.execFile(cmd, cmdParams, function(err, data) {
    console.log(data);
  });
}
```

By no means, should the `execFile()` function leave a comfort feeling of safety. Some Linux OS shell commands do allow invoking other programs from their own execution, so just limiting the passing of parameters to that command is not helpful.

W> ## Avoid when possible
W> Avoid at all costs executing arbitrary commands from within your Node.js program. In the last resort when that is required, always make use of execFile function call, and only to known and well-understood OS commands which can not be tricked into running commands passed in parameters.

{pagebreak}

## Summary

Injection attacks aren't always easy to defect against, which makes them one of the top ranking OWASP vulnerabilities. They require understanding of the context the code is executed in, ability to escape the data correctly, and implementing it correctly and getting it right isn't straightforward.

The bread and butter of safely mitigating injection attacks are properly validating user input, and properly escaping it. Master these through out all layers of your application to follow the security in depth paradigm.

T> ## OWASP Injection reading
T> OWASP features good resources to learn and extend your knowledge further on injection attacks, amongst them are the basic [injection theory](https://www.owasp.org/index.php/Injection_Theory) guide, and the [injection prevention cheat sheet](https://www.owasp.org/index.php/Injection_Prevention_Cheat_Sheet)
