# Injection Flaws

Injection attacks exploit vulnerabilities in systems and applications that fail to validate, escape, and secure their methods of utilizing other sub-systems. Such injection flaws apply to many components, among the most popular are SQL injections, and Operating System injection.

Increased security awareness when developing software is essential to mitigate such attacks. Following best practices and secure code helps mitigate injection vulnerabilities as follows:
* Validation - confirm that when passing data to a sub-system it confirms to an expected type or format
* Escaping or Encoding - always escape or encode data when passing to a sub-system to ensure it is handled properly

Making use of these practices in each component differs. Taking SQL Injections as an example, an implementation of the Escaping or Encoding rule is implied by the use of Prepared Statements or also known as Parameters Binding technique, which ensures that the at an SQL level, the data is properly escaped and appended to an SQL query.

T> ## More read
T> More information about this topic can be found on OWASP's [injections flaws](https://www.owasp.org/index.php/Injection_Flaws) section.

## NoSQL Injections

Similar to SQL injections, improper validation or escaping of user manipulated input can lead to dynamic queries that are executed on NoSQL databases.

Due to the different nature of SQL and NoSQL databases, the attack vector isn't necessarily the same. For example, a common user input such as illustrated below will not have an affect on NoSQL database even if the malicious user input has not been properly sanitized or escaped:

NoSQL query to validate user login credentials:
```js
db.users.findOne({username: username, password: password});
```
User Input:
```
admin' --
```

While trying to alter the original query this will not have any catastrophic affects on a NoSQL database such as MongoDB.
On the other hand, if this input was to run on an SQL Database which doesn't properly validate or escape strings, then the result would be as follows:

```sql
-- Original query in code:
-- SELECT id, user FROM users WHERE username = '$username' AND password = '$password'
SELECT id, user FROM users WHERE username = 'admin' -- AND password = ''
```

### The Risk

ExpressJS by default will not provide a mechanism to access any data sent in a non-GET request, which is an obvious problem when implementing simple things such as login forms which send form data or a JSON POST requests. To quote the [official guide](http://expressjs.com/en/api.html) on expressjs.com on this:
> req.body contains key-value pairs of data submitted in the request body. By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser and multer.

The `body-parser` library makes it available to parse data and it is widely used today in the majority of ExpressJS projects as the standard way of accessing requests body payload.
In-fact it is so popular that as of writing this book, the body-parser library has been downloaded for roughly 5 million times just this past month.

body-parser has two main parsing middlewares which are described as follows:
* `bodyParser.json()` - this middleware is designed to parse JSON payload that is sent over an `application/json` content type.
* `bodyParser.urlencoded()` - this middleware is designed to parse form field payloads which are common to HTML page implementations that get sent over an `application/x-www-form-urlencoded` content type.

With either of these parsing methods enabled, the result is that body-parser populates the `req.body` object with properties names, based on the payload that got sent on the request.
In the case of the `.json()` method it will further attempt to convert any strings to actual objects that will populate `req.body`.

#### Threats

Beyond the obvious noSQL injection that can lead to bypassing user authentication, there are severe threats to a MongoDB server such as Denial of Service (DOS) attacks where an attacker would deliberately inject a complicated RegEx or matching statement that will throw MongoDB into CPU resource hogging actions such as full table scans.

Another security threat is related to privacy and data leakage where an attacker can provide a RegEx value that will match many records in order to pull out information from the MongoDB server.


### The Solution





## OS Injection

...
