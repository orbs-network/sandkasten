import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CardContent, CardActions, Card, TextField } from '@material-ui/core';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods, onUpdateStateView }) => {

  const [state, setState] = useState({});

  const execute = async (methodName, args = []) => {
    const {data} = await axios.post(`${basePath}/api/execute`, {
      type: 'tx',
      contractName,
      method: methodName,
      args
    });
    onUpdateStateView(data);
    const newState = {...state};
    newState[methodName].result = data.result.OutputArguments[0].Value;
    setState(newState);
  };

  useEffect(() => {
    const newState = methods.reduce((acc, curr) => {
      acc[curr.methodName] = curr;
      acc[curr.methodName].result = null;
      return acc;
    }, {});
    setState(newState);
  }, [methods]);

  const renderMethod = ({ methodName, args, result }) => {
    return (
      <Card key={methodName}>
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
        <Typography variant="h6">{result}</Typography>
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
