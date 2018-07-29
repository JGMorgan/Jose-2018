const bcrypt = require('bcrypt');
const crypto = require('crypto');

let _dataStore = {};

function _base64Decode(key) {
  return Buffer.from(key, 'base64').toString('utf-8');
}

function signup(password) {
  const saltRounds = 12;
  return new Promise((resolve, reject) => {
    /*
    Bcrypt only uses the first 72 characters of a password when comparing
    Since longer passwords won't provide any security benefit I imposed the limit
    */
    if (password.length > 72 || password.length < 1) {
      resolve({statusCode: 400, response: 'Maximum password length is 72 characters. Minimum length is 1 character.'});
    } else {
      bcrypt.hash(password, saltRounds).then((hash) => {
        _dataStore['password'] = hash;
        resolve({statusCode: 201, response: 'Created'});
      }).catch((err) => {
        console.err("There was an error encrypting the user's password", err);
        resolve({statusCode: 500, response: 'Internal server error'});
      });
    }
  });
}

function storePublicKey(key, password) {
  return new Promise((resolve, reject) => {
    const storedPassword = _dataStore['password'];
    if (storedPassword == null) {
      resolve({statusCode: 401, response: "Unauthorized! We don't have credentials stored, please sign up."});
    } else {
      bcrypt.compare(password, storedPassword).then((valid) => {
        if (!valid) {
          resolve({statusCode: 401, response: 'Unauthorized! The provided password was incorrect.'});
        } else {
          _dataStore['publicKey'] = _base64Decode(key);
          resolve({statusCode: 201, response: 'Created'});
        }
      }).catch((err) => {
        console.err("There was an error decrypting the user's password", err);
        resolve({statusCode: 500, response: 'Internal server error'});
      });
    }
  });
}

function verifySignature(message, signature) {
  /*
  For the sake of simplicity sha256 is the only supported hash algorithm
  The signature is also assumed to be base64 encoded otherwise verification will return false
  */
  const verifier = crypto.createVerify('sha256');
  const signatureBuf = Buffer.from(signature, 'base64')
  verifier.update(message);
  const publicKey = _dataStore['publicKey'];
  if (publicKey == null) {
    return {statusCode: 400, response: 'Bad Request! Public key never provided!'};
  }
  const verified = verifier.verify(publicKey, signatureBuf);

  if (verified) {
    return {statusCode: 200, response: 'OK'};
  } else {
    return {statusCode: 400, response: 'Bad Request!'};
  }
}

module.exports = {signup, storePublicKey, verifySignature};