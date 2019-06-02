import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import PlayIcon from '@material-ui/icons/PlayArrow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    margin: 16
  },
  icon: {
    position: 'relative',
    top: 5
  },
  playIcon: {
    position: 'relative',
    right: 3
  },
  avatar: {
    color: '#474747'
  },
  typeChip: {
    position: 'relative',
    top: 17,
    left: 13
  },
  resultConsole: {
    background: '#303030',
    color: '#e8e8e8',
    fontWeight: 700,
    textAlign: 'left',
    padding: 8,
    margin: 16
  }
});

const basePath =
  process.env.NODE_ENV === 'production' ? '/edge' : 'http://localhost:3030';

const Inspector = ({
  contractName,
  methods,
  onUpdateStateView,
  classes,
  signer,
  users
}) => {
  const [state, setState] = useState({});

  const updateMethodInFlight = methodName => {
    const newState = { ...state };
    newState[methodName].inflight = true;
    setState(newState);
  };

  const execute = async (methodName, args) => {
    updateMethodInFlight(methodName);
    const { data } = await axios.post(`${basePath}/api/execute`, {
      type: 'tx',
      contractName,
      user: `user${signer}`,
      method: methodName,
      args: args || []
    });
    onUpdateStateView(data);
    const newState = { ...state };

    if (data.ok) {
      newState[methodName].args.forEach((_, index) => {
        newState[methodName].args[index].value = '';
      });
      if (data.result.outputArguments.length) {
        newState[methodName].result = data.result.outputArguments[0].value;
      } else {
        newState[methodName].result = 'Success';
      }
    }

    newState[methodName].inflight = false;
    setState(newState);
  };

  useEffect(() => {
    const newState = methods.reduce((acc, curr) => {
      acc[curr.methodName] = curr;
      if (curr.args) {
        acc[curr.methodName].args = curr.args.map(a => ({
          name: a.Name,
          type: a.Type,
          value: null
        }));
      } else {
        acc[curr.methodName].args = [];
      }
      acc[curr.methodName].result = null;
      return acc;
    }, {});
    setState(newState);
  }, [contractName, methods]);

  const setArgValue = (methodName, argIndex, value) => {
    const newState = { ...state };
    newState[methodName].args[argIndex].value = value;
    setState(newState);
  };

  const handleDropdownChange = event => {
    const newState = { ...state };

    const targetMethodName = event.target.name.split('_')[0];
    const targetArg = event.target.name.split('_')[1];
    const argIndex = newState[targetMethodName].args.findIndex(
      elem => elem.name === targetArg
    );

    newState[targetMethodName].args[argIndex].value = event.target.value;

    console.log(newState);

    setState(newState);
  };

  const renderMethod = ({ methodName, args, result, inflight }, index) => {
    let resultConsoleElem;

    if (inflight) {
      resultConsoleElem = (
        <React.Fragment>
          <CircularProgress className={classes.progress} color='secondary' />
        </React.Fragment>
      );
    } else {
      if (result !== null) {
        resultConsoleElem = (
          <Paper className={classes.resultConsole}>{result}</Paper>
        );
      }
    }

    return (
      <Card key={index} className={classes.root}>
        <CardHeader
          avatar={
            <Avatar className={classes.avatar}>
              {methodName.substr(0, 1).toUpperCase()}
            </Avatar>
          }
          title={methodName.toUpperCase()}
          subheader='Contract method'
        />
        <CardContent>
          {!!args &&
            args.map((arg, idx) => {
              const selectName = `${methodName}_${arg.name}`;

              const selectRequired =
                arg.name === 'to' ||
                arg.name === 'from' ||
                arg.name === 'spender' ||
                arg.name === 'owner'
                  ? true
                  : false;
              if (selectRequired && arg.type === '[]byte') {
                return (
                  <div key={idx}>
                    <FormControl
                      className={classes.selectRoot}
                      autoComplete='off'
                      style={{ width: '50%' }}
                    >
                      <InputLabel htmlFor={selectName}>{arg.name}</InputLabel>
                      <Select
                        value={arg.value}
                        onChange={handleDropdownChange}
                        inputProps={{
                          name: selectName,
                          id: selectName
                        }}
                      >
                        {users
                          .filter(user => user.Name !== `user${signer}`)
                          .map(user => {
                            return (
                              <MenuItem value={user.Address}>
                                {user.Name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                    <Chip
                      className={classes.typeChip}
                      label={arg.type.toUpperCase()}
                    />
                  </div>
                );
              }

              return (
                <div key={idx}>
                  <TextField
                    onChange={ev =>
                      setArgValue(methodName, idx, ev.target.value)
                    }
                    key={idx}
                    label={arg.name}
                    value={arg.value}
                  />
                  <Chip
                    className={classes.typeChip}
                    label={arg.type.toUpperCase()}
                  />
                </div>
              );
            })}
        </CardContent>
        <CardActions>
          <Button
            disabled={inflight}
            onClick={() => execute(methodName, args)}
            variant='contained'
            color='secondary'
            size='small'
          >
            <PlayIcon className={classes.playIcon} />
            Execute
          </Button>
        </CardActions>
        {resultConsoleElem}
      </Card>
    );
  };
  return (
    <React.Fragment>
      <Typography variant='h6'>Contract Name: {contractName}</Typography>
      {Object.values(state).map((method, index) => renderMethod(method, index))}
    </React.Fragment>
  );
};

export default withStyles(styles)(Inspector);
