const fs = require('fs');
const utils = require('ntils');
const stp = require('stp');
const os = require('os');
const path = require('path');

const noop = function () { };

//获取 spawn
function getSpawn(opts) {
  if (opts.builtIn) {
    return require('child_process').spawn;
  }
  try {
    return require('pty.js').spawn;
  } catch (err) {
    return require('child_process').spawn;
  }
}

//获取 shell
function getShell(opts) {
  if (opts.platform === 'darwin') {
    return process.env.SHELL || '/bin/bash';
  } else if (opts.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  } else {
    return process.env.SHELL || '/bin/sh';
  }
}

//获取 shell flags
function getFlags(opts) {
  if (opts.isWin) {
    return ['/d', '/s', '/c'];
  } else {
    return ['-c'];
  }
}

//解析源码
function parseSource(source, opts) {
  if (!source) return source;
  opts = opts || {};
  if (utils.isFunction(source)) {
    source = source.toString();
    var match = source.match(/[^]*\/\*([^]*)\*\/\s*\}$/);
    if (match) {
      source = match[1];
    }
  }
  if (utils.isArray(source)) {
    source = source.join(os.EOL);
  }
  if (opts.isWin) {
    source = source.trim().split('\n').join(' && ');
  } else {
    source = 'set -e ' + os.EOL + source;
  }
  return stp(source, opts.params || {});
}

function getOptions(opts) {
  opts = opts || {};
  opts.platform = opts.platform || process.platform;
  opts.isWin = opts.isWin || opts.platform === 'win32';
  opts.windowsVerbatimArguments = opts.isWin;
  return opts;
}

//执行
function shify(source, opts) {
  opts = getOptions(opts);
  let spawn = getSpawn(opts);
  let shell = opts.shell || getShell(opts);
  let flags = opts.flags || getFlags(opts);
  let args = opts.args || [];
  let script = parseSource(source, opts);
  let commands = [].concat(flags, script, args);
  return spawn(shell, commands, opts);
};

module.exports = shify;