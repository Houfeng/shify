var child_process = require('child_process');
var fs = require('fs');
var utils = require('real-utils');
var stp = require('stp');
var Context = require('./context');

var SHELL_ERROR = 'ShellError';

function parseSource(source, params) {
  if (utils.isFunction(source)) {
    source = source.toString();
    var match = source.match(/[^]*\/\*([^]*)\*\/\s*\}$/);
    if (match) {
      source = match[1];
    }
  }
  return stp(source, params);
}

function shify(source, options) {
  var context = new Context();
  process.nextTick(function () {
    try {
      options = options || {};
      source = parseSource(source, options.params || {});
      var tmpFile = process.env.TMPDIR + utils.newGuid();
      var delCalled = false;
      var delTmpFile = function () {
        if (delCalled) return;
        delCalled = true;
        fs.unlink(tmpFile, function (err) {
          if (err) return context.emit('error', err);
          context.emit('success');
        });
      };
      fs.writeFile(tmpFile, source, function (err) {
        if (err) return context.emit('error', err);
        var cmd = options.cmd || 'sh';
        var args = options.args || [];
        args.unshift(tmpFile);
        context.childProcess = child_process.spawn(cmd, args, options);
        context.stdin.pipe(context.childProcess.stdin);
        context.childProcess.stdout.pipe(context.stdout);
        context.childProcess.stderr.pipe(context.stderr || context.stdout);
        context.childProcess.stderr.on('end', delTmpFile);
        context.childProcess.stdout.on('end', delTmpFile);
        context.childProcess.on('close', function (code) {
          context.emit('close', code);
        });
        context.childProcess.on('error', function (err) {
          context.emit('error', err);
        });
      });
    } catch (err) {
      context.emit('error', err);
    }
  });
  return context;
};

module.exports = shify;