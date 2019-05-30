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

function populateDefaults(files) {
  const counterCode = require('./defaults/counter');
  const counterTestCode = require('./defaults/counter-test');
  const erc20Code = require('./defaults/erc20');
  files.new('Counter', counterCode);
  files.new('Counter_test', counterTestCode);
  files.new('erc20', erc20Code);
}

populateDefaults(files);
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
    const {
      stateJson,
      eventsJson,
      gammaOutput
    } = await contracts.callGammaServer(req.body);

    res.json({
      ok: true,
      eventsJson,
      stateJson,
      result: gammaOutput
    });
  } catch (err) {
    console.log(err);
    res.json({
      ok: false,
      stateJson: {},
      result: err
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

app.get('/api/events', async (req, res) => {
  const contractName = req.query.contractName;
  const returnJson = await contracts.getContractEvents({ contractName });

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
  const file = files.load('THE_ONE_AND_ONLY_FILE');
  file.code = req.body.data;
  files.save(file);

  const {
    ok,
    deploymentError,
    contractName,
    methods,
    stateJson,
    eventsJson
  } = await contracts.decorateAndDeploy(file);

  res.json({
    ok,
    deploymentError,
    eventsJson,
    contractName,
    methods,
    stateJson
  });
  res.end();
});

app.post('/api/deploy/:name', async (req, res) => {
  const {
    contractName,
    methods,
    stateJson,
    deploymentError,
    eventsJson
  } = await contracts.decorateAndDeploy(files.load(req.params.name));

  res.json({
    ok: true,
    deploymentError,
    eventsJson,
    contractName,
    methods,
    stateJson
  });
  res.end();
});

app.post('/api/test/:name', async (req, res) => {
  const { stdout, stderr, success } = await contracts.runTest(req.params.name);

  res.json({
    ok: true,
    allTestsPassed: success,
    output: stdout,
    stderr: stderr
  });
  res.end();
});

app.get('/api/users', async (req, res) => {
  const users = require('./orbs-test-keys.json');
  const sanitized = Object.entries(users).map(([Name, { Address }]) => ({
    Name,
    Address
  }));
  res.json({
    ok: true,
    users: sanitized
  });
  res.end();
});

const targetPort = process.env.port || 3030;

app.listen(targetPort, function() {
  console.log('frontend server started and listening on port', targetPort);
});
