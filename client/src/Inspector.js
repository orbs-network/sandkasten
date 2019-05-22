import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CardContent, CardActions, Card, TextField } from '@material-ui/core';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods, onUpdateStateView }) => {

  const [state, setState] = useState({});

  const execute = (methodName, args = []) => {
    axios.post(`${basePath}/api/execute`, {
      type: 'tx',
      contractName,
      method: methodName,
      args
    }).then(onUpdateStateView)
  };

  useEffect(() => {
    const newState = methods.reduce((acc, curr) => {
      acc[curr.methodName] = curr;
      acc[curr.methodName].result = null;
      return acc;
    }, {});
    setState(newState);
  }, [methods]);

  const testCall = () => {
    axios.post(`${basePath}/api/execute`, {
      type: 'tx',
      contractName,
      method: 'add',
      args: [{
        value: 5,
        type: 'uint64'
      }]
    }).then(onUpdateStateView);
  };

  const renderMethod = ({ methodName, args, result }) => {
    return (
      <Card key={methodName}>
        <CardContent>
          <Button onClick={testCall}>Add 5</Button>
        </CardContent>
        <CardContent>
          <Typography variant="h5" component="h2">
            {methodName} {' '}
            <Button
              onClick={() => execute(methodName)}
              variant="contained"
              color="secondary"
              size="small">Execute</Button>
          </Typography>

          {!!args && args.map((arg, idx) => <Typography>
            <TextField key={idx} label={arg.Name} placeholder={arg.Type} />
          </Typography>)}
        </CardContent>
        <CardActions>
          {result}
        </CardActions>
      </Card>
    )
  }
  return (
    <>
      <Typography variant="h6">Contract Name: {contractName}</Typography>
      {Object.values(state).map(method => renderMethod(method))}
    </>
  );
};

export default Inspector;
