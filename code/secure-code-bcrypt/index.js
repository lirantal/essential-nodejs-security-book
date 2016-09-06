'use strict';

var bcrypt = require('bcrypt');

/**
 * {string} hash value
 */
var h;

for (var i = 0; i <= 20; i++) {
  console.log('--> hash timer for salt rounds: ' + i);
  // start the timer
  console.time('hashtimer' + i);
  // computer the hash with a salts round value of i
  h = bcrypt.hashSync("hacktheplanet", i);
  // clock the timer and print the profiling time
  console.timeEnd('hashtimer' + i);
}
