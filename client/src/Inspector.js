import axios from 'axios';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CardContent, CardActions, Card } from '@material-ui/core';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods, onUpdateStateView }) => {

  const testCall = () => {
    axios.post(`${basePath}/api/execute`, {
      type: 'query',
      contractName,
      method: 'add',
      args: [{
        value: 5,
        type: 'uint64'
      }]
    }).then((res) => {
      onUpdateStateView(res.data.stateJson.result);
    });
  };

  const execute = (methodName) => {
  };

  const renderMethod = ({ methodName, args }) => {
    return (
      <Card>
        <CardContent></CardContent>
        <CardActions>
          <Button size="small">Execute</Button>
        </CardActions>
      </Card>
      // <div key={methodName}>
      //   <p>Method name: <code>{methodName}</code></p>
      //   <ul>
      //     {args.map((arg, idx) => <li key={idx}>
      //       <p>{arg.name} <input type="text" /></p>
      //     </li>)}
      //   </ul>
      //   <button onClick={() => execute(methodName)}>Execute</button>
      // </div>
    )
  }
  return (
    <>
      <Typography variant="h6">Contract Name: {contractName}</Typography>
      <button onClick={testCall}>Test</button>
      {methods.map(m => renderMethod(m))}
    </>
  );
};

export default Inspector;
