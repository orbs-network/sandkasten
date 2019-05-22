import axios from 'axios';
import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

const styles = theme => ({
  currentValueChip: {
    background: '#75797f'
  }
});

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const ContractState = ({ contractName }) => {
  const [state, setState] = useState({});
  const getState = async () => {
    const { data } = await axios.get(`${basePath}/api/state`, {
      params: {
        contractName
      }
    });
    setState(data.result);
  };
  return (
    <React.Fragment>
      <button onClick={getState}>Get State</button>
      <div>
        <code>{JSON.stringify(state)}</code>
      </div>
    </React.Fragment>
  )
};

export default withStyles(styles)(ContractState);
