# auth0-conn-radius-server
Radius server using authentication with Auth0 Connection


## Usage

    node auth0-connection-radius-server.js

    Options:
      --domain   [required, auth0 domain]
      --secret   [required, radius secret, not auth0 secret]
      --client_id [required, auth0 client id]
      --connection [required, auth0 DB/AD connection name]
      --port     [default: 1812]
      --address  [default: "0.0.0.0"]

### Only supports RADIUS PAP (password authentication protocol)
