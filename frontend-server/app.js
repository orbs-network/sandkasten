'use strict';

const express = require('express');
const fs = require('fs');
const util = require('util');
const { exec } = require('child-process-promise');
const writeFile = util.promisify(fs.writeFile);
const uuid = require('uuid');
const path = require('path');
const { decodeHex } = require('orbs-client-sdk');

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

const app = express();
app.use(require('cors')(corsOption));
app.use(require('body-parser').json());

async function discoverContract({ contractName }) {
    const contractFilepath = `/tmp/${contractName}.go`;

    const result = await exec(`go run gestapo.go -contract ${contractFilepath}`, { cwd: path.join(path.dirname(__dirname), 'goebbels') });
    return result.stderr;
}

async function getContractState({ contractName }) {
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

app.post('/api/send', async (req, res) => {
    const incomingJson = {
        type: 'tx',
        contractName: req.body.contractName,
        method: 'add',
        args: [
            {
                value: 5,
                type: 'uint64'
            }
        ]
    };

    // Generate the json for sending the request
    const requestJsonObject = {
        ContractName: incomingJson.contractName,
        MethodName: incomingJson.method,
        Arguments: incomingJson.args.map((anArg) => {
            return {
                Type: anArg.type,
                Value: anArg.value.toString(),
            };
        })
    };

    const requestJsonFilepath = `/tmp/${uuid()}.json`;

    await writeFile(requestJsonFilepath, JSON.stringify(requestJsonObject));
    const requiredCallType = (incomingJson.type === 'tx') ? 'send-tx' : 'run-query';

    try {
        const callResult = await exec(`gamma-cli ${requiredCallType} ${requestJsonFilepath} -signer user1`);
        console.log(callResult.stdout);
        res.json({
            ok: true,
            result: JSON.parse(callResult.stdout),
        });
    } catch (err) {
        console.log(err);
        res.json({
            ok: false,
            result: err,
        });
    }

    res.end();
});

app.get('/api/state', async (req, res) => {
    const contractName = req.query.contractName;
    const returnJson = await getContractState({ contractName });

    res.json(returnJson);
    res.end();
});

app.get('/api/discover/contract', async (req, res) => {
    const contractName = req.query.contractName;
    const gammaResponse = await discoverContract({ contractName });

    res.json({
        ok: true,
        data: JSON.parse(gammaResponse)
    });
    res.end();
});

app.post('/api/deploy', async (req, res) => {
    const assignedUid = uuid();
    const contractName = `contract_${assignedUid}`;
    const contractFilepath = `/tmp/${contractName}.go`;
    const decoratedContractFilepath = `/tmp/${contractName}_decorated.go`;

    // Write the contract somewhere
    console.log('writing the contract to file');
    await writeFile(contractFilepath, req.body.data);

    await exec(`go run goebbels.go -contract ${contractFilepath} -output ${decoratedContractFilepath}`, { cwd: path.join(path.dirname(__dirname), 'goebbels') });

    const deployResult = await exec(`gamma-cli deploy ${decoratedContractFilepath} -name ${contractName} -signer user1`);
    console.log(deployResult.stdout);
    console.log(deployResult.stderr);

    const gammaResponse = await discoverContract({ contractName });
    const stateJson = await getContractState({ contractName });

    res.json({
        ok: true,
        contractName,
        methods: JSON.parse(gammaResponse),
        stateJson,
    });
    res.end();
});

const targetPort = process.env.port || 3030;

app.listen(targetPort, function () {
    console.log('frontend server started and listening on port', targetPort);
});