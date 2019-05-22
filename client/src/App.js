import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Editor from './Editor';
import Inspector from './Inspector';
import ContractState from './ContractState';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

const App = () => {
  const [contractName, setContractName] = useState('');
  const [methods, setMethods] = useState({});

  const deploymentHandler = async (code) => {
    const {data} = await axios.post(`${basePath}/api/deploy`, {data: code});
    const {contractName} = data;
    setContractName(contractName);    
  };
  return (
    <div className="container">
      <header className="header">Orbs Smart Contracts Playground</header>
      <section className="pane1">
        <h2>Code</h2>
        <Editor onDeploy={deploymentHandler} />
      </section>
      <section className="pane2">
        <h2>Methods</h2>
        <Inspector methods={methods} contractName={contractName}/>
      </section>
      <article>
        <ContractState contractName={contractName} />
      </article>
      <footer className="footer">&copy; 2019 Orbs Network</footer>
    </div>
  );
};

export default App;
