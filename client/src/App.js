import React, { useState } from 'react';
import './App.css';
import Editor from './Editor';
import Inspector from './Inspector';

const App = () => {
  const [code, setCode] = useState('');
  const [contractName, setContractName] = useState('');
  const deploymentHandler = (code, contractName) => {
    setCode(code);
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
        <Inspector code={code} contractName={contractName}/>
      </section>
      <footer className="footer">&copy; 2019 Orbs Network</footer>
    </div>
  );
};

export default App;
