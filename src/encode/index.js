/**
 * Generates a RSA key pair for encryption and decryption.
 * @returns {Promise<JsonWebKey>} The public key in JSON Web Key (JWK) format.
 */
async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export publicKey and privateKey as JWK (JSON Web Key)
  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );

  //! Save privateKey to localStorage
  localStorage.setItem("privateKey", JSON.stringify(privateKeyJwk));

  return publicKeyJwk;
}

/**
 * Encrypts a message using the provided public key in JWK format.
 * @param {JsonWebKey} publicKeyJwk The public key in JWK format.
 * @param {string} message The message to encrypt.
 * @returns {Promise<ArrayBuffer>} The encrypted message as an ArrayBuffer.
 */
async function encryptMessage(publicKeyJwk, message) {
  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt"]
  );

  //! Encrypt the message
  const encodedMessage = new TextEncoder().encode(message);
  const encryptedMessage = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedMessage
  );

  return encryptedMessage;
}

/**
 * Decrypts a message using the stored private key in JWK format.
 * @param {ArrayBuffer} encryptedMessage The encrypted message to decrypt.
 * @returns {Promise<string>} The decrypted message as a string.
 */
async function decryptMessage(encryptedMessage) {
  const privateKeyJwk = JSON.parse(localStorage.getItem("privateKey"));

  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    true,
    ["decrypt"]
  );

  //! Decrypt the message
  const decryptedMessage = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedMessage
  );

  return new TextDecoder().decode(decryptedMessage);
}

/**
 * Converts an ArrayBuffer to a base64-encoded string.
 * @param {ArrayBuffer} buffer The ArrayBuffer to convert.
 * @returns {string} The base64-encoded string.
 */
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a base64-encoded string back to an ArrayBuffer.
 * @param {string} base64 The base64-encoded string.
 * @returns {ArrayBuffer} The resulting ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  arrayBufferToBase64,
  base64ToArrayBuffer,
};
