
hardening-expressjs.md
 - http://expressjs.com/en/advanced/best-practice-security.html
 - use an up to date version of expressjs
 - configure secure sockets layer with TLS
 - static code analysis with eslint
 - bithound, david-dm
 - http parameter pollution
 -

xss.md
 - considering reviewing more resources of xss in nodejs like: secure-filters



# TODO items which I am considering to review in the book
* Showing how to work with an SSL setup in expressjs
* Covering for chapter1 the cookie.path option
* Using session stores:
var RedisStore = require('connect-redis')(express);

app.use(express.cookieParser());
app.use(express.session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    db: 2,
    pass: 'RedisPASS'
  }),
  secret: '1234567890QWERTY'
}));

var MongoStore = require('connect-mongo')(express);

app.use(express.cookieParser());
app.use(express.session({
  store: new MongoStore({
    url: 'mongodb://root:myPassword@mongo.onmodulus.net:27017/3xam9l3'
  }),
  secret: '1234567890QWERTY'
}));

* csurf
var csrf = require('csurf');

var app = express();

app.use(session({
  secret: 'My super session secret',
  cookie: {
    httpOnly: true,
    secure: true
  }
}));

app.use(csrf());

app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

  input(type='hidden', name='_csrf', value=_csrf)
