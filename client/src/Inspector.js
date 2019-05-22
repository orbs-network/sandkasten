import axios from 'axios';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CardContent, CardActions, Card, TextField } from '@material-ui/core';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods }) => {

  const execute = (methodName) => {
  
  };
  const renderMethod = ({methodName, args}) => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2">
            {methodName} <Button size="small">Execute</Button>
          </Typography>

          {!!args && args.map(arg => <Typography>
            <TextField label={arg.Name} placeholder={arg.Type} />
          </Typography>)}
        </CardContent>
        <CardActions>
          
        </CardActions>
      </Card>
    )
  }
  return (
    <>
      <Typography variant="h6">Contract Name: {contractName}</Typography>
      {methods.map(m => renderMethod(m))}
    </>
  );
};

export default Inspector;
