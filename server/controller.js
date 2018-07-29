const express = require('express');
var bodyParser = require('body-parser')
const service = require('./service');

const app = express();
app.use(bodyParser.json())

app.put('/users/signup', (req, res) => {
  const password = req.body.password;
  service.signup(password).then((results) => {
    res.status(results.statusCode).send(results.response);
  });
});

app.put('/security/key', (req, res) => {
  const password = req.body.password;
  const publicKey = req.body.key;
  service.storePublicKey(publicKey, password).then((results) => {
    res.status(results.statusCode).send(results.response);
  });
});

app.put('/message/verify', (req, res) => {
  const signature = req.body.signature;
  const message = req.body.message;
  const results = service.verifySignature(message, signature);
  res.status(results.statusCode).send(results.response);
});


app.listen(8080);