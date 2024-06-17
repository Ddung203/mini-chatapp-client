async function exportPrivateKey(fileName) {
  try {
    // Convert the private key to a JSON string
    const privateKeyJwk = JSON.parse(localStorage.getItem("privateKey"));
    const privateKeyStr = JSON.stringify(privateKeyJwk);

    // Create a new file handle using the File System Access API
    const options = {
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    };
    const handle = await window.showSaveFilePicker({
      suggestedName: `privateKeyStr-${fileName}.json`,
      ...options,
    });

    // Create a writable stream
    const writableStream = await handle.createWritable();

    // Write the JSON string to the file
    await writableStream.write(privateKeyStr);

    // Close the writable stream
    await writableStream.close();

    console.log("Private key successfully exported!");
  } catch (error) {
    console.error("An error occurred during export:", error);
  }
}

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

/**
 * Imports a private key from a file and returns it as a CryptoKey.
 * @param {File} file - The file containing the private key in JSON format.
 * @returns {Promise<CryptoKey>} The private key.
 */

async function importPrivateKey() {
  try {
    // Mở hộp thoại để người dùng chọn file
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
      multiple: false,
    });

    // Lấy nội dung file
    const file = await fileHandle.getFile();
    const fileContent = await file.text();
    const privateKeyJwk = JSON.parse(fileContent);

    // Import private key
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

    // Lưu private key vào localStorage
    localStorage.setItem("privateKey", JSON.stringify(privateKeyJwk));

    // console.log("Private key successfully imported!");
  } catch (error) {
    console.error("An error occurred during import:", error);
  }
}

export {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  importPrivateKey,
  exportPrivateKey,
};
