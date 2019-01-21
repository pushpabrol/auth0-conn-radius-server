# auth0-conn-radius-server
Radius server using authentication with Auth0 Connection

## Auth0 Configuration
Create a M2M application in Auth0, and assign to Management API.
Enable "Password" grant type under "Advanced settings".
Copy client_id, client_secret etc. to command line.


## Usage

    node index.js --address [address] --port [port]
        --domain <auth0_domain> --audience <auth0_api_identifier> 
        --connection [auth0_connection_name] 
        --client_id <auth0_client_id> --client_secret <auth0_client_secret> 
        --secret <radius_secret>

### Options:
      --help           Show help                                           [boolean]
      --version        Show version number                                 [boolean]
      --domain                                                   [string] [required]
      --secret                                                   [string] [required]
      --client_id                                                [string] [required]
      --client_secret                                            [string] [required]
      --audience                                                 [string] [required]
      --port                                                         [default: 1812]
      --address                                        [string] [default: "0.0.0.0"]
      --connection                                                     [default: ""]

The connection option can be used to specify a connection to authenticate against. This is highly recommended, otherwise you would have to set a tenant-wide "Default Directory".

### Only supports RADIUS PAP (password authentication protocol)
