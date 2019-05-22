import axios from 'axios';
import React from 'react';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const Inspector = ({ contractName, methods }) => {

  const testCall = () => {
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

  const execute = (methodName) => {
  
  };
  const renderMethod = ({methodName, args}) => {
    return (
      <div key={methodName}>
        <p>Method name: <code>{methodName}</code></p>
        <ul>
          {args.map((arg, idx) => <li key={idx}>
            <p>{arg.name} <input type="text" /></p>
          </li>)}
        </ul>
        <button onClick={() => execute(methodName)}>Execute</button>
      </div>
    )
  }
  return (
    <>
      <p>Contract Name: {contractName}</p>
      <button onClick={testCall}>Test</button>
      {methods.map(m => renderMethod(m))}
    </>
  );
};

export default Inspector;
