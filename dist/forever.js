'use strict';

var forever = require('forever-monitor');

var child = new forever.Monitor('index.js', {
    max: 3000000,
    silent: false,
    args: []
});

child.start();