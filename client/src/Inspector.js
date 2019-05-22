import axios from 'axios';
import React from 'react';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods }) => {

  const execute = () => {
    axios.post(`${basePath}/api/send`, {
      type: 'query',
      contractName,
      method: 'add',
      args: [{
        value: 5,
        type: 'uint64'
      }]
    })
  };
  return (
    <>
      <div>Hello Inspector</div>
      <p>Contract Name: {contractName}</p>
      <button onClick={execute}>Test</button>
    </>
  );
};

export default Inspector;
