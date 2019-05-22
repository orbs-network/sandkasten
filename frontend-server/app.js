'use strict';

const express = require('express');

const { FileManager } = require('./file-manager');
const { ContractManager } = require('./contract-manager');

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

const app = express();
app.use(require('cors')(corsOption));
app.use(require('body-parser').json());

const files = new FileManager();
const contracts = new ContractManager(files);

app.get('/api/files', async (req, res) => {
    res.json(files.list());
    res.end();
});

app.get('/api/files/:name', async (req, res) => {
    res.json(files.load(req.params.name));
    res.end();
});

app.post('/api/files/:name', async (req, res) => {
    const file = files.load(req.params.name);
    file.code = req.body.data;
    files.save(file);
    res.end();
});

app.post('/api/execute', async (req, res) => {

    try {
        const {stateJson, gammaOutput} = await contracts.callGammaServer(req.body);

        res.json({
            ok: true,
            stateJson,
            result: gammaOutput,
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
    const returnJson = await contracts.getContractState({ contractName });

    res.json(returnJson);
    res.end();
});

app.get('/api/discover/contract', async (req, res) => {
    const contractName = req.query.contractName;
    const gammaResponse = await contracts.discoverContract({ contractName });

    res.json({
        ok: true,
        data: JSON.parse(gammaResponse)
    });
    res.end();
});

app.post('/api/deploy', async (req, res) => {
    const file = files.load("THE_ONE_AND_ONLY_FILE");
    file.code = req.body.data;
    files.save(file);

    const {ok, gammaResultJson, contractName, methods, stateJson} = await contracts.decorateAndDeploy(file);

    res.json({
        ok,
        gammaResultJson,
        contractName,
        methods,
        stateJson,
    });
    res.end();
});

app.post('/api/deploy/:name', async (req, res) => {
    const {contractName, methods, stateJson} = contracts.decorateAndDeploy(files.load(req.params.name))

    res.json({
        ok: true,
        contractName,
        methods,
        stateJson,
    });
    res.end();
});

app.post('/api/test/:name', async (req, res) => {
    const {stdout, success} = await contracts.runTest(req.params.name);

    res.json({
        ok: true,
        allTestsPassed: success,
        output: stdout,
    });
    res.end();
});

const targetPort = process.env.port || 3030;

app.listen(targetPort, function () {
    console.log('frontend server started and listening on port', targetPort);
});
