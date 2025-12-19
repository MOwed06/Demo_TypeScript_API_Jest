const path = require("path");
process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, "..", "my-cert.pem");
// Allow self-signed certificates - must be set before any HTTPS requests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
