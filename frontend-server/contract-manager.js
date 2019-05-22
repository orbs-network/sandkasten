const fs = require('fs');
const util = require('util');
const { exec } = require('child-process-promise');
const writeFile = util.promisify(fs.writeFile);
const uuid = require('uuid');
const path = require('path');
const { decodeHex } = require('orbs-client-sdk');
const tmp = require('tmp-promise');

class ContractManager {
    constructor(files) {
        this.files = files;
    }

    async runTest(testContractFileName) {
        const contractFile = this.files.load(testContractFileName.substring(0, testContractFileName.indexOf("_test")));
        const testFile = this.files.load(`${testContractFileName}`);

        const tmpDir = await tmp.dir({unsafeCleanup: true});

        await writeFile(`${path.join(tmpDir.path, contractFile.name)}.go`, contractFile.code);
        await writeFile(`${path.join(tmpDir.path, testFile.name)}.go`, testFile.code);

        try {
            const {stdout, stderr} = await exec(`go test -v`, { cwd: tmpDir.path});
            return {stdout, stderr, success: true};
        } catch ({stdout, stderr}) {
            return {stdout, stderr, success: false};
        } finally {
            tmpDir.cleanup();
        }

    }

    async discoverContract({ contractName }) {
        const contractFilepath = `/tmp/${contractName}.go`;

        const result = await exec(`go run gestapo.go -contract ${contractFilepath}`, { cwd: path.join(path.dirname(__dirname), 'gestapo') });
        return result.stderr;
    }

    async getContractState({ contractName }) {
        let returnValue;
        // Generate the json for sending the request
        const requestJsonObject = {
            ContractName: contractName,
            MethodName: 'goebbelsReadProxiedState',
            Arguments: []
        };

        const requestJsonFilepath = `/tmp/inspect_state.json`;
        await exec(`rm -f ${requestJsonFilepath}`);
        await writeFile(requestJsonFilepath, JSON.stringify(requestJsonObject));

        try {
            const callResult = await exec(`gamma-cli run-query ${requestJsonFilepath} -signer user1`);
            console.log(callResult.stdout);
            const responseFromBlockchain = JSON.parse(callResult.stdout);

            returnValue = {
                ok: true,
                result: JSON.parse(Buffer.from(decodeHex(responseFromBlockchain.OutputArguments[0].Value)).toString()),
            };

        } catch (err) {
            console.log(err);
            returnValue = {
                ok: false,
                result: err,
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

        await exec(`go run goebbels.go -contract ${contractFilepath} -output ${decoratedContractFilepath}`, { cwd: path.join(path.dirname(__dirname), 'goebbels') });

        const deployResult = await exec(`gamma-cli deploy ${decoratedContractFilepath} -name ${contractName} -signer user1`);
        console.log(deployResult.stdout);
        console.log(deployResult.stderr);

        const gammaResponse = await this.discoverContract({ contractName });
        const stateJson = await this.getContractState({ contractName });
        const methods = JSON.parse(gammaResponse);

        file.lastContractIdInGamma = contractName;
        this.files.save(file);

        return {contractName, methods, stateJson}
    }

    async callGammaServer({type, contractName, method, args}) {
        // Generate the json for sending the request
        const requestJsonObject = {
            ContractName: contractName,
            MethodName: method,
            Arguments: args.map((anArg) => {
                return {
                    Type: anArg.type,
                    Value: anArg.value.toString(),
                };
            })
        };

        const requestJsonFilepath = `/tmp/${uuid()}.json`;

        await writeFile(requestJsonFilepath, JSON.stringify(requestJsonObject));
        const requiredCallType = (type === 'tx') ? 'send-tx' : 'run-query';
        const callResult = await exec(`gamma-cli ${requiredCallType} ${requestJsonFilepath} -signer user1`);
        const gammaOutputJson = callResult.stdout;

        console.log(gammaOutputJson);
        const stateJson = await this.getContractState({ contractName });
        const gammaOutput = JSON.parse(gammaOutputJson);

        return {stateJson, gammaOutput};
    }
}


module.exports = {
    ContractManager,
};
