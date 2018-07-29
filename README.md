This application uses `express` to run the server and `bcrypt` to securely store passwords.

Run `npm install` to install both of those dependencies.

## Running the Server
Once all the dependencies are installed run `npm start` to run the server. Alternatively you can run `node server/controller.js`.

## Running the Client
The client can send a password to the server by running `node client/client.js signup -p PASSWORD`

Send a public key to the server by running `node client/client.js storeKey -p PASSWORD -k FILE_PATH`. Note that public key has to be stored in a file. Since keys are often long and split into multiple lines this prevents any issues with the new lines and makes the command look cleaner.

Sign a message by running `node client/client.js signMessage -m MESSAGE -k FILE_PATH`. Just as the previous command the private key needs to be provided in a file. This command will print out the signature it will not send it to the server. I did this because I figured you would want to send the message separate so you can manipulate the message and signature to try to break the server.

Send a signed message to the server by running `node client/client.js verifySignature -m MESSAGE -s SIGNATURE`. The message won't be stored on the server this just checks if the signature matches the message.