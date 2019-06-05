const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._buffer = '';
  }

  bufferSend() {
    this.push(this._buffer);
    this._buffer = '';
  }

  _transform(chunk, encoding, callback) {
    const arr = chunk.toString().split(os.EOL);
    switch (arr.length) {
      case 0:
        /* empty value */
        break;
      case 1:
        this._buffer += arr[0];
        break;
      default:
        this._buffer += arr[0];
        for (let counter = 1; counter <= (arr.length - 1); counter++) {
          this.bufferSend();
          this._buffer = arr[counter];
        }
    }
    callback();
  }

  _flush(callback) {
    if (this._buffer.length > 0) {
      this.bufferSend();
    }
    callback();
  }
}

module.exports = LineSplitStream;
