/**
 * File: certificate-builder.ts
 * Description: utility to generate self-signed certificates for testing secure API endpoints.
 * Author: Github Copilot
 */

import { generateKeyPairSync, createSign, createHash } from "crypto";

// Self-signed certificate generation for secure API testing
interface SelfSignedCertificate {
  privateKey: string;
  publicKey: string;
  certificate: string;
}

function generateSelfSignedCertificate(
  commonName = "localhost",
  organization = "BigBooks Test",
  validityDays = 1
): SelfSignedCertificate {
  // Generate RSA key pair using Node's crypto API
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const notBefore = new Date();
  const notAfter = new Date();
  notAfter.setDate(notAfter.getDate() + validityDays);

  const subject = `CN=${commonName}, O=${organization}`;
  const serialNumber = createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .substring(0, 16);

  // Sign the certificate
  const sign = createSign("SHA256");
  sign.update(publicKey);
  sign.end();
  const signature = sign.sign(privateKey, "base64");

  // Create certificate
  const certificate = [
    "-----BEGIN CERTIFICATE-----",
    `Subject: ${subject}`,
    `Serial: ${serialNumber}`,
    `Valid: ${notBefore.toISOString()} to ${notAfter.toISOString()}`,
    `Signature: ${signature}`,
    "-----END CERTIFICATE-----",
  ].join("\n");

  return { privateKey, publicKey, certificate };
}

export { SelfSignedCertificate, generateSelfSignedCertificate };
