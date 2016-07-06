var md5 = require('md5');
var fs = require('fs');
var path = require('path');
var os = require('os');
var Cache = require('smache');

var SCRIPT_EXTNAME = process.platform === 'win32' ? '.bat' : '.sh';

var cache = new Cache({
  max: 1000
});

module.exports = function (source) {
  var fielname = md5(source);
  var filepath = cache.get(fielname);
  if (filepath) return filepath;
  filepath = path.resolve(process.env.TMPDIR, fielname + SCRIPT_EXTNAME);
  fs.writeFileSync(filepath, ['#!/bin/bash', '', source].join(os.EOL));
  fs.chmodSync(filepath, '777');
  cache.set(fielname, filepath);
  return filepath;
};