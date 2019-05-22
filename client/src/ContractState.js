import axios from 'axios';
import React, { useState } from 'react';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const ContractState = ({ contractName }) => {
  const [state, setState] = useState({});
  const getState = async () => {
    const { data } = await axios.get(`${basePath}/api/state`, {
      params: {
        contractName
      }
    });
    setState(data);
  };
  return (
    <>
      <button onClick={getState}>Get State</button>
    </>
  )
};

export default ContractState;
