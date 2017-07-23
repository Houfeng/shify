const fs = require('fs');
const utils = require('ntils');
const stp = require('stp');
const os = require('os');
const path = require('path');

const noop = function () { };

//获取 spawn
function getSpawn(opts) {
  try {
    if (opts.pty) {
      return require('pty.js').spawn;
    } else {
      return require('child_process').spawn;
    }
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
    let flags = ['/d', '/s', '/c'];
    let bash_env = process.env.WIN_BASH || process.env.BASH;
    if (opts.tmpFile && bash_env) flags.push(bash_env);
    return flags;
  } else {
    return ['-c'];
  }
}

//解析源码
function parseSource(source, params) {
  if (!source) return source;
  params = params || {};
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
  return stp(source, params);
}

//临时文件 
function tmpFile(script, opts) {
  let tmpDir = process.env.TMPDIR || process.env.TEMP;
  let extname = opts.isWin ? 'bat' : 'sh';
  let filename = path.normalize(`${tmpDir}/${utils.newGuid()}.${extname}`);
  fs.writeFileSync(filename, script);
  if (!opts.isWin) fs.chmodSync(filename, '777');
  return filename;
}

//执行
function shify(source, opts) {
  opts = opts || {};
  opts.platform = opts.platform || process.platform;
  opts.isWin = opts.isWin || opts.platform === 'win32';
  opts.windowsVerbatimArguments = opts.isWin;
  opts.tmpFile = opts.tmpFile || opts.isWin;
  let spawn = getSpawn(opts);
  let shell = opts.shell || getShell(opts);
  let flags = opts.flags || getFlags(opts);
  let script = parseSource(source, opts.params);
  let execable = opts.tmpFile ? tmpFile(script, opts) : script;
  let args = [].concat(flags, execable, opts.args || []);
  // console.log('------------------------------------------------');
  // console.log('执行:', shell, args.join(' '));
  // console.log('------------------------------------------------');
  let io = spawn(shell, args, opts);
  io.on('exit', () => {
    if (fs.existsSync(execable)) fs.unlink(execable, noop);
  });
  return io;
};

module.exports = shify;