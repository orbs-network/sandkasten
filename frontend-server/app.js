'use strict';

const express = require('express');
const fs = require('fs');
const util = require('util');
const { exec } = require('child-process-promise');
const writeFile = util.promisify(fs.writeFile);
const uuid = require('uuid');
const path = require('path');

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

const app = express();
app.use(require('cors')(corsOption));
app.use(require('body-parser').json());

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

    res.json({
        ok: true,
        contractName,
    });
    res.end();
});

const targetPort = process.env.port || 3030;

app.listen(targetPort, function () {
    console.log('frontend server started and listening on port', targetPort);
});