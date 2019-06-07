const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);
    const filepath = path.join(__dirname, 'files', pathname);

    /**
     * @param {number} errNum
     * @param {string} errText
     * @param {string} filenameRemove
     */
    const throwError = (errNum, errText, filenameRemove = null) => {
      if (errNum) {
        res.writeHead(errNum, errText);
        res.end(`ERROR #${errNum.toString()}: ${errText}`);
      } else {
        res.end();
      }
      if (filenameRemove) {
        // console.log(`Trying to remove file ${filenameRemove}`);
        fs.unlink(filenameRemove, (err) => {
          if (err) {
            console.warn(`Can't remove mistaken file ${filenameRemove}`);
          }
          // console.log(`Removed file ${filenameRemove}`);
        });
      }
    };

    switch (req.method) {
      case 'POST':
        const fileStream = fs.createWriteStream(filepath, {flags: 'wx'});
        fileStream
            .on('error', (e) => {
              switch (e.code) {
                case 'EEXIST':
                  throwError(409, `File ${pathname} is already present.`);
                  break;
                default:
                  console.warn(e);
                  throwError(500, 'Unknown file error');
              }
            })
            .on('data', (err, chunk) => {
              console.log(err, chunk);
            });

        fileStream.__proto__._write = (chunk, encoding, callback) => {
          console.log(chunk);
          callback(null, chunk);
        };

        const limitStream = new LimitSizeStream({limit: (10)});
        limitStream.on('error', (e) => {
          switch (e.code) {
            case 'EEXIST':
              console.log('Way 2');
              throwError(409, `File ${pathname} is already present.`);
              break;
            case 'LIMIT_EXCEEDED':
              throwError(
                  413,
                  `File '${pathname}' upload limit ${limitStream.limit} bytes exceeded.`,
                  filepath
              );
              // limitStream.end();
              break;
            default:
              console.warn(e);
              throwError(500, 'Unknown stream limit error');
          }
        });
        req
            .pipe(limitStream)
            .pipe(fileStream)
            /* .on('error', (e) => {
              console.warn(e);
              throwError(500, `Unknown error.`, filepath);
            }) */
            .on('finish', () => {
              res.writeHead(201, 'OK');
              res.end('OK');
            });
        break;
      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    console.warn(e);
  }
});

module.exports = server;
