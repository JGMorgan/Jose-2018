const crypto = require('crypto');
const fs = require('fs');
const http = require('http');

const host = 'localhost';
const port = '8080';

start();

/*
Sending passwords via http is unsafe since anyone can look at your packets and see your password
The solution would be to use https but for simplicity that wasn't done
*/
function singup(password) {
  const path = '/users/signup';
  sendRequest(path, {'password': password}).then((statusCode) => {
    if (statusCode === 201) {
      console.log('Password was successfully stored!');
    } else if (statusCode === 400) {
      console.log('Maximum password length is 72 characters. Minimum length is 1 character.');
    } else {
      console.log("Error!");
    }
  });
}

function storePublicKey(key, password) {
  const path = '/security/key';
  const body = {
    'password': password,
    'key': key
  };
  sendRequest(path, body).then((statusCode) => {
    if (statusCode === 201) {
      console.log('Public Key was successfully stored!');
    } else if (statusCode === 401) {
      console.log('The password you provided is incorrect.');
    } else {
      console.log("Error!");
    }
  });
}

function verifySignature(message, signature) {
  const path = '/message/verify';
  const body = {
    'message': message,
    'signature': signature
  }
  sendRequest(path, body).then((statusCode) => {
    if (statusCode === 200) {
      console.log('The signature matched the message.');
    } else if (statusCode === 400) {
      console.log("The signature didn't match the message.");
    }
  });
}

function signMessage(message, privateKey) {
  const signer = crypto.createSign('sha256');
  signer.update(message);
  console.log(base64Encode(signer.sign(privateKey)));
}

function sendRequest(path, body) {
  return new Promise((resolve, reject) => {
    var params = {
      'host': host,
      'port': port,
      'path': path,
      'method': 'PUT',
      'headers': {
        'Content-Type' : 'application/json'
      }
    };
    const req = http.request(params, (res) => {
      resolve(res.statusCode);
    });
    req.write(JSON.stringify(body));
    req.end();
  });
}

function base64Encode(keyBuf) {
  return keyBuf.toString('base64');
}

function getCmdArg(args, flag) {
  const index = args.indexOf(flag);
  if (index === args.length - 1 || index === -1) {
    //required flag was never passed or it was passed with no value after
    return null;
  }
  //value should always come right after the flag
  return args[index + 1];
}

function start() {
  const args = process.argv.slice(2); //index 0 is the node command, index 1 is the js file
  let password = '';
  let keyPath = '';
  let signature = '';
  let message = '';

  switch(args[0]) {
    case 'signup':
      password = getCmdArg(args, '-p');
      if (password == null || password === '') {
        console.log("Please enter a valid command");
      } else {
        singup(password);
      }
      break;
    case 'storeKey':
      password = getCmdArg(args, '-p');
      keyPath = getCmdArg(args, '-k');
      if (password == null || password === '' || keyPath == null || keyPath === '') {
        console.log("Please enter a valid command");
      } else {
        fs.readFile(keyPath, (err, key) => {
          if (err) {
            console.log('There was an error reading the provided file');
          } else {
            /*
            public key is base64 encoded to ensure things
            like new line characters don't break anything
            */
            storePublicKey(base64Encode(key), password);
          }
        });
      }
      break;
    case 'verifySignature':
      signature = getCmdArg(args, '-s');
      message = getCmdArg(args, '-m');
      if (message == null || message === '' || signature == null || signature === '') {
        console.log("Please enter a valid command");
      } else {
        verifySignature(message, signature);
      }
      break;
    case 'signMessage':
      /*
      sign message command only signs and does not send the signature and message
      to the server, I figured you guys would want to be able to send that separately
      to be able to manipulate the message and signature to make the server fail
      */
      keyPath = getCmdArg(args, '-k');
      message = getCmdArg(args, '-m');
      if (message == null || message === '' || keyPath == null || keyPath === '') {
        console.log("Please enter a valid command");
      } else {
        fs.readFile(keyPath, (err, key) => {
          if (err) {
            console.log('There was an error reading the provided file');
          } else {
            signMessage(message, key);
          }
        });
      }
      break;
    default:
      console.log('Please look at the README for usage!');
  }
}
