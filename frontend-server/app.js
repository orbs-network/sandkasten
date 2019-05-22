'use strict';

const express = require('express');

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

const app = express();
app.use(require('cors')(corsOption));
app.use(require('body-parser').json());

app.post('/api/deploy', async (req, res) => {
    console.log('received the following payload:');
    console.log(req.body);

    res.json({
        ok: true,
    });
    res.end();
});

const targetPort = process.env.port || 3030;

app.listen(targetPort, function () {
    console.log('frontend server started and listening on port', targetPort);
});