var util = require('util');
var EventEmitter = require('events');
var Transform = require('./transform');

function Context() {
  EventEmitter.call(this);
  this.stdin = new Transform();
  this.stdout = new Transform();
  this.stderr = new Transform();
}
util.inherits(Context, EventEmitter);

module.exports = Context;