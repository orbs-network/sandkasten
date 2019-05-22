import React from 'react';
import './App.css';
import Editor from './Editor';

const App = () => {
  return (
    <div className="container">
      <header className="header">Orbs Smart Contracts Playground</header>      
      <section className="pane1">
        <h2>Code</h2>
        <Editor />
      </section>
      <section className="pane2">
        <h2>Methods</h2>
        <div></div>
      </section>
      <footer className="footer">&copy; 2019 Orbs Network</footer>
    </div>
  );
};

export default App;
