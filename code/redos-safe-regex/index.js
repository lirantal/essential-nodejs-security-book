'use strict';

var safeRegex = require('safe-regex');

//var regex = /^(a+)$/;
var regex = /^(a+){10}$/;
var regexSafe = safeRegex(regex);
var str = Array(100).join('a') + '!';

console.log(regex.test(str));
console.log(regexSafe);