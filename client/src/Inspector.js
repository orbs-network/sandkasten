import axios from 'axios';
import React, { useState, useEffect } from 'react';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ code, contractName }) => {
  const [methods, setMethods] = useState([]);
  const extractMethods = () => {
    const line = `PUBLIC = sdk.Export(`;
    console.log(code.indexOf(line));
  }

  useEffect(() => {
    console.log(extractMethods(code));
  }, [code]);

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
      <button onClick={execute}>Test</button>
    </>
  );
};

export default Inspector;
