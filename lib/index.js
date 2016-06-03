var child_process = require('child_process');
var fs = require('fs');
var utils = require('real-utils');
var stp = require('stp');
var Context = require('./context');

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

function exec(source, options) {
  var context = new Context();
  process.nextTick(function () {
    try {
      options = options || {};
      source = parseSource(source, options.params || {});
      var tmpFile = process.env.TMPDIR + utils.newGuid();
      var shellErr = null;
      var delCalled = false;
      var delTmpFile = function () {
        if (delCalled) return;
        delCalled = true;
        fs.unlink(tmpFile, function (err) {
          if (shellErr || err) {
            return context.emit('error', shellErr || err);
          }
          context.emit('success');
        });
      };
      fs.writeFile(tmpFile, source, function (err) {
        if (err) return context.emit('error', err);
        options.cmd = options.cmd || 'sh';
        options.args = options.args || [];
        options.args.unshift(tmpFile);
        context.childProcess = child_process.spawn(options.cmd, options.args, options.args);
        context.stdin.pipe(context.childProcess.stdin);
        context.childProcess.stdout.pipe(context.stdout);
        context.childProcess.stderr.pipe(context.stderr);
        context.childProcess.stderr.on('end', delTmpFile);
        context.childProcess.stdout.on('end', delTmpFile);
        context.childProcess.stderr.on('data', function () {
          shellErr = new Error('Shell Error');
        });
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

module.exports = exec;