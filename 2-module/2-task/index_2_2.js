const LineSplitStream = require('./LineSplitStream');
const os = require('os');
const stream = require('stream');

const lines = new LineSplitStream({
  encoding: 'utf-8',
});

function onData(line) {
  console.log(line + '_');
}

class Transformer extends stream.Transform {

  constructor(opt) {
    super(opt);
    this._size = (opt.highWaterMark) ? opt.highWaterMark : 0;
  }

  _transform(chunk, encoding, callback) {
    if (this._size > 0) {
      callback(null, chunk);
    } else {
      this.push();
      callback();
    }
  }
}

const trans = new Transformer({
  highWaterMark: 20,
});

lines.on('data', onData);

// lines.write(`первая строка${os.EOL}вторая строка${os.EOL}третья строка`);

trans.pipe(lines);
trans.write(`первая строка${os.EOL}вторая строка${os.EOL}третья строка`);
lines.end();
// trans.write(``);
