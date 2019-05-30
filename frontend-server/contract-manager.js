const fs = require('fs');
const util = require('util');
const { exec } = require('child-process-promise');
const writeFile = util.promisify(fs.writeFile);
const uuid = require('uuid');
const path = require('path');
const { decodeHex } = require('orbs-client-sdk');
const tmp = require('tmp-promise');
const { queryContract, callContract } = require('./orbs-adapter');
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
      const result = Buffer.from(callResult.outputArguments[0].value).toString()
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

    const deployResult = await exec(
      `gamma-cli deploy ${decoratedContractFilepath} -name ${contractName} -signer user1`
    );

    const gammaResultJson = JSON.parse(deployResult.stdout);
    if (gammaResultJson.ExecutionResult === 'ERROR_SMART_CONTRACT') {
      return { ok: false, gammaResultJson };
    }
    console.log('stdout: ', deployResult.stdout);
    console.log('stderr: ', deployResult.stderr);

    const gammaResponse = await this.discoverContract({ contractName });
    const stateJson = await this.getContractState({ contractName });
    const eventsJson = await this.getContractEvents({ contractName });
    const methods = JSON.parse(gammaResponse);

    file.lastContractIdInGamma = contractName;
    this.files.save(file);

    return {
      ok: true,
      contractName,
      methods,
      stateJson,
      gammaResultJson,
      eventsJson
    };
  }

  async callGammaServer({ type, contractName, method, args, user }) {
    // Generate the json for sending the request
    const requestJsonObject = {
      ContractName: contractName,
      MethodName: method,
      Arguments: args.map(anArg => {
        let theType = anArg.type;
        if (theType === '[]byte') {
          theType = 'bytes';
        }
        return {
          Type: theType,
          Value: anArg.value.toString()
        };
      })
    };

    user = user || 'user1'; // for backwards compatibility

    const requestJsonFilepath = `/tmp/${uuid()}.json`;

    await writeFile(requestJsonFilepath, JSON.stringify(requestJsonObject));
    const requiredCallType = type === 'tx' ? 'send-tx' : 'run-query';
    const callResult = await exec(
      `gamma-cli ${requiredCallType} ${requestJsonFilepath} -signer ${user}`
    );
    const gammaOutputJson = callResult.stdout;

    const stateJson = await this.getContractState({ contractName });
    const eventsJson = await this.getContractEvents({ contractName });
    const gammaOutput = JSON.parse(gammaOutputJson);

    return { stateJson, gammaOutput, eventsJson };
  }
}

module.exports = {
  ContractManager
};
