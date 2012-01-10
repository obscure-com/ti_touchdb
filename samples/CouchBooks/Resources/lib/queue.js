/**
 * Asynchronous method queue
 * http://www.dustindiaz.com/async-method-queues
 * (c) Justin Diaz
 * modified to run as a CommonJS module by Paul Mietz Egli
 */

exports.Queue = function() {
  // store your callbacks
  this._methods = [];

  // keep a reference to your response
  this._response = null;

  // all queues start off unflushed
  this._flushed = false;
};


// adds callbacks to your queue
exports.Queue.prototype.add = function(fn) {
  // if the queue had been flushed, return immediately
  if(this._flushed) {
    fn(this._response);
    // otherwise push it on the queue
  } else {
    this._methods.push(fn);
  }
};


exports.Queue.prototype.flush = function(resp) {
  // note: flush only ever happens once
  if(this._flushed) {
    return;
  }

  // store your response for subsequent calls after flush()
  this._response = resp;

  // mark that it's been flushed
  this._flushed = true;

  // shift 'em out and call 'em back
  while(this._methods[0]) {
    this._methods.shift()(resp);
  }
};
