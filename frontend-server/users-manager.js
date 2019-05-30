const { decodeHex } = require('orbs-client-sdk');

const rawUsers = require('../orbs-test-keys.json');
const users = {};
for (let [Name, { PrivateKey, PublicKey, Address }] of Object.entries(
  rawUsers
)) {
  users[Name] = {
    PrivateKey: decodeHex(PrivateKey),
    PublicKey: decodeHex(PublicKey),
    Address: decodeHex(Address)
  };
}

function getUser(userName) {
  return users[userName];
}

module.exports = {
  getUser
};
