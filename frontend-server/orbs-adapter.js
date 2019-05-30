const { argUint32, argString, argBytes, Client } = require('orbs-client-sdk');

const ORBS_END_POINT = 'http://localhost:8080';
const ORBS_VCHAIN_ID = 42;
const client = new Client(ORBS_END_POINT, ORBS_VCHAIN_ID, 'MAIN_NET');

async function callContract(user, contractName, methodName, ...params) {
  const [tx] = client.createTransaction(
    user.PublicKey,
    user.PrivateKey,
    contractName,
    methodName,
    params
  );
  const txResult = await client.sendTransaction(tx);
  if (txResult.executionResult !== 'SUCCESS') {
    console.log(txResult);
    throw new Error(txResult.executionResult);
  }
  if (txResult.outputArguments.length > 0) {
    console.log(
      `${methodName} returned`,
      txResult.outputArguments[0].value.toString()
    );
  }
  return txResult;
}

async function queryContract(user, contractName, methodName, ...params) {
  const [tx] = client.createQuery(
    user.PublicKey,
    contractName,
    methodName,
    params
  );
  const queryResult = await client.sendQuery(tx);
  if (queryResult.executionResult !== 'SUCCESS') {
    console.log(queryResult);
    throw new Error(queryResult.executionResult);
  }
  if (queryResult.outputArguments.length > 0) {
    console.log(
      `${methodName} returned`,
      queryResult.outputArguments[0].value.toString()
    );
  }
  return queryResult;
}

module.exports = {
  callContract,
  queryContract
};
