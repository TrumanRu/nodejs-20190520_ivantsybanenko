const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  // console.log('URL: ', req.url, 'PATHNAME: ', pathname);
  const filepath = path.join(__dirname, 'files', pathname);

  if (path.dirname(pathname) !== '.') {
    res.writeHead(400);
    res.write(`Don't allow to get files from subdirectories.`);
    res.end();
    return;
  }
  switch (req.method) {
    case 'GET':
      res.writeHead(200, 'OK');
      fs.createReadStream(filepath).on('error', (e) => {
        switch (e.code) {
          case 'ENOENT':
            // console.log('ERR1');
            res.writeHead(404);
            res.write(`File ${pathname} not found.`);
            break;
          default:
            // console.log('ERR2');
            res.writeHead(500);
            res.write(`Unknown error`);
        }
        res.end();
        return;
      }).pipe(res);
      break;
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
