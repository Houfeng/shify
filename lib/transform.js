var util = require('util');
var stream = require('stream');

function Transform(options) {
  stream.Transform.call(this, options);
}
util.inherits(Transform, stream.Transform);

Transform.prototype._transform = function (chunk, encoding, next) {
  this.push(chunk);
  next();
};

Transform.prototype._flush = function (done) {
  done();
};

module.exports = Transform;