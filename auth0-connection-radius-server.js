var auth0ConnRadiusServer = require('./index.js');

var argv = require('yargs')
  .usage('Usage: $0 --address <address> --port [port] --domain <auth0_domain> --client_id <auth0_client_id> --secret <secret>')
  .demand(['domain', 'secret','client_id', 'connection'])
  .default('port', 1812)
  .string('address')
  .default('address', '0.0.0.0')
  .string('domain')
  .string('secret')
  .string('client_id')
  .string('connection')
  .argv;

var server = auth0ConnRadiusServer.createServer({
  domain: argv.domain,
  secret: argv.secret,
  client_id: argv.client_id,
  connection: argv.connection
});

function now() {
  return new Date().toISOString() + ': ';
}

server.on('listening', function () {
  var address = server.address();
  console.log(now() + 'Listening ' + address.address + ':' + address.port);
});

server.on('radius', function (e) {
    console.log(e);
  var type = e.status ? 'success' : 'failure';
  console.log(now() + 'Authentication ' + type + ': ' + e.username + '@' + e.domain);
});

server.on('radius-error', function (err) {
  console.log(now() + err.message);
});

server.bind(argv.port, argv.address);