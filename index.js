var dgram = require('dgram');
var _ = require('underscore');
var radius = require('radius');
var request = require("request");
/**
 * Authenticates user log in.
 *
 * `username` - auth0 username
 * `password` - the password for the user
 * `options` - extra options (optional)
 *    string `connection`  - name of the AD/Database Connection. Only works for endpoints that allow active auth
 *    string `domain` - Auth0 Domain,
 *    string client_id - client_id for the application where the Connection is enabled
 * `callback` - callback with signature: callback(err, obj)
 *  object `obj`
 *    string `username` - the username
 *    string `domain` - auth0 domain
 *    boolean `status`  - true if accepted, false otherwise
 */

var authenticate;
module.exports.authenticate = authenticate = function(username, password, options, callback) {
  
 //auth0 active connection auth

 var url = 'https://' + options.domain + '/oauth/token'

var optionsReq = { method: 'POST',
  url: url,
  headers: { 'content-type': 'application/json' },
  body: 
   { grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
     username: username,
     password: password,
     client_id: options.client_id,
     realm: options.connection 
    },
  json: true };

request(optionsReq, function (error, response, body) {
  if (error) {
  console.log(error);
  callback(error);
  }
  else {
  if(response.statusCode === 200)
  {
    console.log(body);
     var obj = {
            username: username,
            domain: options.domain,
            status: true,
          };

          callback(null, obj);
  }
  else 
  {
    callback(body);
  }
    
  } 
});

}

/**
 * Creates a datagram socket that handles RADIUS Access-Request messages.
 *
 * object `options`
 *  string `secret`   - the radius secret
 *  string `protocol` - "udp4" (default) or "udp6"
 *
 * The additional events can be emitted by the returned socket object:
 *
 * "radius" - when authentication of a user has completed. The following object
 * will be passed with the event:
 *
 *  object `obj`
 *    string `username` - the username
 *    string `domain`   - the auth0 domain
 *    boolean `status`  - true if accepted, false otherwise
 *
 * "radius-error" - when an error occurs decoding or parsing the RADIUS
 * packet. The following object will be passed with the event:
 *
 *  object `obj`
 *    string `domain`  - the auth0 domain the RADIUS server is authenticating against
 *    string `message` - the error description
 */

module.exports.createServer = function (options) {
  // Defaults
  if (!options) {
    options = {};
  }
  if (!options.protocol) {
    options.protocol = 'udp4';
  }

  // Create server
  var server = dgram.createSocket(options.protocol);

  // Register callback
  server.on('message', function (msg, rinfo) {
    try {
      var packet = radius.decode({
        packet: msg,
        secret: options.secret
      });
    } catch (ex) {
      server.emit('radius-error', {
        domain: options.domain,
        message: ex.toString()
      });
      return;
    }

    if (packet.code != 'Access-Request') {
      server.emit('radius-error', {
        domain: options.domain,
        message: 'Packet code error: not "Access-Request"'
      });
      return;
    }

    var username = packet.attributes['User-Name'];
    var password = packet.attributes['User-Password'];

    // Reply function
    authenticate(username, password, options, function (err, obj) {
      var code = !err && obj.status ? 'Access-Accept' : 'Access-Reject';
      var response = radius.encode_response({
        packet: packet,
        code: code,
        secret: options.secret
      });
      server.send(response, 0, response.length, rinfo.port, rinfo.address, function() {
        if (err) {
          obj = {
            username: username,
            domain: options.domain,
            status: false,
          };
        }
        server.emit('radius', obj);
      });
    });
  });

  return server;
};
