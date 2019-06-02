const fs = require('fs');
const util = require('util');
const { exec } = require('child-process-promise');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const uuid = require('uuid');
const path = require('path');
const {
  argUint32,
  argUint64,
  argString,
  argBytes
} = require('orbs-client-sdk');
const tmp = require('tmp-promise');
const {
  queryContract,
  callContract,
  deployContract
} = require('./orbs-adapter');
const { getUser } = require('./users-manager');

class ContractManager {
  constructor(files) {
    this.files = files;
  }

  async runTest(testContractFileName) {
    const contractFile = this.files.load(
      testContractFileName.substring(0, testContractFileName.indexOf('_test'))
    );
    const testFile = this.files.load(`${testContractFileName}`);

    const tmpDir = await tmp.dir({ unsafeCleanup: true });

    await writeFile(
      `${path.join(tmpDir.path, contractFile.name)}.go`,
      contractFile.code
    );
    await writeFile(
      `${path.join(tmpDir.path, testFile.name)}.go`,
      testFile.code
    );

    try {
      const { stdout, stderr } = await exec(`go test -v`, { cwd: tmpDir.path });
      return { stdout, stderr, success: true };
    } catch ({ stdout, stderr }) {
      return { stdout, stderr, success: false };
    } finally {
      tmpDir.cleanup();
    }
  }

  async discoverContract({ contractName }) {
    const contractFilepath = `/tmp/${contractName}.go`;

    const result = await exec(
      `go run gestapo.go -contract ${contractFilepath}`,
      { cwd: path.join(path.dirname(__dirname), 'gestapo') }
    );
    return result.stderr;
  }

  async getContractState({ contractName }) {
    let returnValue;

    try {
      const callResult = await queryContract(
        getUser('user1'),
        contractName,
        'goebbelsReadProxiedState'
      );

      returnValue = {
        ok: true,
        result: JSON.parse(
          Buffer.from(callResult.outputArguments[0].value).toString()
        )
      };
    } catch (err) {
      console.log(err);
      returnValue = {
        ok: false,
        result: err
      };
    }

    return returnValue;
  }

  async getContractEvents({ contractName }) {
    let returnValue;
    try {
      const callResult = await queryContract(
        getUser('user1'),
        contractName,
        'goebbelsReadProxiedEvents'
      );

      let events;
      const result = Buffer.from(
        callResult.outputArguments[0].value
      ).toString();
      if (result === 'null') {
        events = [];
      } else {
        events = JSON.parse(result);
      }

      returnValue = {
        ok: true,
        result: events
      };

      console.log('from events: ', returnValue);
    } catch (err) {
      console.log(err);
      returnValue = {
        ok: false,
        result: err
      };
    }

    return returnValue;
  }

  async decorateAndDeploy(file) {
    const assignedUid = uuid();
    const contractName = `contract_${assignedUid}`;
    const contractFilepath = `/tmp/${contractName}.go`;
    const decoratedContractFilepath = `/tmp/${contractName}_decorated.go`;

    // Write the contract somewhere
    console.log('writing the contract to file');
    await writeFile(contractFilepath, file.code);

    await exec(
      `go run goebbels.go -contract ${contractFilepath} -output ${decoratedContractFilepath}`,
      { cwd: path.join(path.dirname(__dirname), 'goebbels') }
    );

    const decoratedContractCode = await readFile(decoratedContractFilepath);

    const txResultJson = await deployContract(
      getUser('user1'),
      contractName,
      decoratedContractCode.toString()
    );
    if (txResultJson.executionResult === 'ERROR_SMART_CONTRACT') {
      return {
        ok: false,
        deploymentError: txResultJson.outputArguments[0].value || ''
      };
    }

    const discoverResponse = await this.discoverContract({ contractName });
    const stateJson = await this.getContractState({ contractName });
    const eventsJson = await this.getContractEvents({ contractName });
    const methods = JSON.parse(discoverResponse);

    file.lastContractIdInGamma = contractName;
    this.files.save(file);

    return {
      ok: true,
      contractName,
      methods,
      stateJson,
      txResultJson,
      eventsJson
    };
  }

  async callGammaServer({ contractName, method, args, user }) {
    const convertedArgs = args.map(toOrbsArgs);
    console.log(args);
    console.log(convertedArgs);
    const result = await callContract(
      getUser(user),
      contractName,
      method,
      ...convertedArgs
    );
    const stateJson = await this.getContractState({ contractName });
    const eventsJson = await this.getContractEvents({ contractName });

    return { stateJson, result, eventsJson };
  }
}

function toOrbsArgs(arg) {
  switch (arg.type) {
    case 'uint32':
      return argUint32(Number(arg.value) || 0);

    case 'uint64':
      return argUint64(Number(arg.value) || 0);

    case 'string':
      return argString(arg.value);

    case '[]byte':
      return argBytes(arg.value);

    default:
      break;
  }
}

module.exports = {
  ContractManager
};
