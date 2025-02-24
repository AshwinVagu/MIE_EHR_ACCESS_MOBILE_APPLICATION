import { Meteor } from "meteor/meteor";
import { Buffer } from "buffer";          // Node.js Buffer for base64 operations
import zlib from "zlib"; 
import axios from "axios";
import * as jose from "jose"; 

function base64Decode(data) {
    let padding = '='.repeat((4 - data.length % 4) % 4); 
    return Buffer.from(data + padding, 'base64url').toString('utf-8');
}

async function verifyIss(iss) {
    const smartConfigUrl = `${iss}/.well-known/smart-configuration`;

    try {
      const response = await axios.get(smartConfigUrl);
      const smartConfig = response.data;

      if (smartConfig.issuer !== iss) {
        console.error("Issuer validation failed. The 'iss' does not match the SMART configuration's issuer.");
        return false;
      }

      const requiredFields = ["authorization_endpoint", "token_endpoint", "capabilities"];
      for (const field of requiredFields) {
        if (!smartConfig.hasOwnProperty(field)) {
          console.error(`SMART configuration missing required field: ${field}`);
          return false;
        }
      }

      if (!iss.startsWith("https://")) {
        console.error("Issuer must use HTTPS.");
        return false;
      }

      for (const field of ["authorization_endpoint", "token_endpoint"]) {
        if (!smartConfig[field].startsWith("https://")) {
          console.error(`${field} must use HTTPS.`);
          return false;
        }
      }

      console.log("Issuer verified successfully and SMART configuration is valid.");
      return true;

  } catch (error) {
      console.error(`Failed to fetch SMART configuration: ${error.message || error}`);
      return false;  // Return false for any kind of failure
  }
}

// Fetch the public key from the issuer's JWKS endpoint
async function fetchPublicKey(iss) {
  try {
      const jwksUrl = `${iss}/.well-known/jwks.json`;
      const response = await axios.get(jwksUrl);
      return response.data.keys;
  } catch (error) {
      console.error("Error fetching public keys:", error.message);
      return null;
  }
}

// Verify the JWS Signature
async function verifySignature(header, payload, signature, iss) {
  const keys = await fetchPublicKey(iss);
  if (!keys || keys.length === 0) return false;

  try {
      // Convert JWK to a Key Object
      const keyStore = jose.createLocalJWKSet({ keys });

      // Verify JWS
      await jose.compactVerify(`${header}.${payload}.${signature}`, keyStore);
      
      return true; 
  } catch (error) {
      console.error("Signature verification failed:", error.message);
      return false;
  }
}

Meteor.methods({
 async "decryptScannedData"(shcData) {
    try {
        const initCode = shcData;
        this.unblock();
        // Step 1: Remove the "shc:/" prefix
        if (shcData.startsWith("shc:/")) {
          shcData = shcData.slice(5);
        }
    
        // Step 2: Convert the numeric string to ASCII
        let pairs = [];
        for (let i = 0; i < shcData.length; i += 2) {
          pairs.push(String.fromCharCode(parseInt(shcData.slice(i, i + 2)) + 45));
        }
        const jws = pairs.join('');
    
        // Step 3: Split the JWS into its components
        const parts = jws.split('.');
        if (parts.length !== 3) {
          throw new Error("Decoded data does not have a valid JWS structure");
        }
        const [header, payload, signature] = parts;
    
        // Step 4: Base64-decode the header and payload
        const headerJson = JSON.parse(base64Decode(header));
    
        const compressedPayload = Buffer.from(payload, 'base64url');
        let payloadJson;
    
        if (headerJson.zip === "DEF") {
          const decompressedPayload = zlib.inflateRawSync(compressedPayload);
          payloadJson = JSON.parse(decompressedPayload.toString('utf-8'));
        } else {
          payloadJson = JSON.parse(compressedPayload.toString('utf-8'));
        }

        // Step 5: Verify the issuer
        const iss = payloadJson.iss;
        let isVerifiedIssuer;
        try{
            isVerifiedIssuer = await verifyIss(iss);
        }
        catch(err){
            isVerifiedIssuer = false;  
          console.log("Error in verifying issuer: ", err.message);
        }

        let isSignatureValid = false;
        try {
            isSignatureValid = await verifySignature(header, payload, signature, iss);
        } catch (err) {
            console.log("Error verifying signature:", err.message);
        }

    
        return JSON.stringify({ header: headerJson, payload: payloadJson, isVerified: isVerifiedIssuer && isSignatureValid, qrCode: initCode });
      } catch (err) {
        console.error("Error decoding SMART Health Card:", err.message);
        return null;
      }
  }
});