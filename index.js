var auth0ConnRadiusServer = require('./backend.js');

var argv = require('yargs')
  .usage('Usage: $0 --address <address> --port [port] --domain <auth0_domain> --audience <auth0_api_identifier> --connection <auth0_connection_name> --client_id <auth0_client_id> --client_secret <auth0_client_secret> --secret <secret>')
  .demand(['domain', 'secret','client_id', 'client_secret', 'audience'])
  .default('port', 1812)
  .string('address')
  .default('address', '0.0.0.0')
  .string('domain')
  .string('secret')
  .string('client_id')
  .string('client_secret')
  .default('connection', '')
  .string('audience')
  .argv;

var server = auth0ConnRadiusServer.createServer({
  domain: argv.domain,
  secret: argv.secret,
  client_id: argv.client_id,
  client_secret: argv.client_secret,
  audience: argv.audience,
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
