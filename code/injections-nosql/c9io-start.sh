#!/bin/bash
rm -rf /data/db/mongod.lock
mongod --smallfiles &
sleep 3
node index.js
