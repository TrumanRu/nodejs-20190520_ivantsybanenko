// const stream = require('stream');
const {Transform} = require('stream');
const LimitExceededError = require('./LimitExceededError');

class TransformBase extends Transform {
  constructor(options) {
    super(options);
    if (options.highWaterMark != null) {
      // something
    }
  }

  _transform(chunk, encoding, callback) {
    throw new Error('Не определён метод _transform');
  }

  function1() {
    this._transform();
  }

  function2() {

  }
}

class LimitSizeStream extends TransformBase {
  constructor(options) {
    super(options);
    this._limit = (options.limit == null) ? 0 : options.limit;
    this._total = 0;
    this.on('error', (e) => {
      // console.error(e);
      // this.destroy(e);
    });
  }

  _transform(chunk, encoding, callback) {
    const totalNext = this._total + chunk.length;
    if (totalNext > this._limit) {
      callback(new LimitExceededError(`Data limit exceeded: ${this._limit}`), null);
    } else {
      this._total = totalNext;
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
