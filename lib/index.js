var spawn = require('pty.js').spawn;
var fs = require('fs');
var utils = require('real-utils');
var stp = require('stp');

var WINDOWNS_VERBATIM_ARGUMENTS = process.platform === 'win32';

function parseSource(source, params) {
  if (!source) return source;
  if (utils.isFunction(source)) {
    source = source.toString();
    var match = source.match(/[^]*\/\*([^]*)\*\/\s*\}$/);
    if (match) {
      source = match[1];
    }
  }
  var script = stp(source, params);
  return script.trim().split('\n').join('&&');
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
  source = parseSource(source, options.params);
  var cmd = options.cmd || defaultShell();
  var args = shellFlags().concat(source, options.args);
  return spawn(cmd, args, options);
};

module.exports = shify;