var fs = require('fs');
var utils = require('ntils');
var stp = require('stp');
var temp = require('./temp');
var spawn = getSpawn();

var WINDOWNS_VERBATIM_ARGUMENTS = process.platform === 'win32';

function getSpawn() {
  try {
    return require('pty.js').spawn;
  } catch (err) {
    return require('child_process').spawn;
  }
}

function parseSource(source, params) {
  if (!source) return source;
  if (utils.isFunction(source)) {
    source = source.toString();
    var match = source.match(/[^]*\/\*([^]*)\*\/\s*\}$/);
    if (match) {
      source = match[1];
    }
  }
  return stp(source, params);
}

function defaultShell() {
  if (process.platform === 'darwin') {
    return process.env.SHELL || '/bin/bash';
  }
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
}

function shellFlags() {
  if (process.platform === 'win32') {
    return ['/d', '/s', '/c'];
  }
  return ['-c'];
}

function shify(source, options) {
  options = options || {};
  options.windowsVerbatimArguments = WINDOWNS_VERBATIM_ARGUMENTS;
  options.params = options.params || {};
  options.args = options.args || [];
  options.flags = options.flags || [];
  var cmd = options.cmd || defaultShell();
  var flags = options.flags;
  var script = parseSource(source, options.params);
  if (options.temp) {
    script = temp(script);
  } else {
    flags = flags.concat(shellFlags());
  }
  var args = [].concat(flags, script, options.args);
  return spawn(cmd, args, options);
};

module.exports = shify;