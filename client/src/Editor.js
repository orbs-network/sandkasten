import React, { useCallback } from 'react';
import { editor } from 'monaco-editor';
import { counter } from './contracts/counter';
import Button from '@material-ui/core/Button';

const Editor = ({ onDeploy, buttonClasses }) => {
  let e;
  const editorRef = useCallback(node => {
    if (node !== null) {
      e = editor.create(node, {
        value: counter,
        language: 'go'
      })
    }
  }, []);

  const deployHandler = () => {
    onDeploy(e.getValue());
  };

  return (
    <div>
      <Button className={buttonClasses} variant="contained" color="primary" onClick={deployHandler}>Deploy</Button>
      <article ref={editorRef} style={{ marginTop: 16, height: 580 }}></article>
    </div>
  )
};
export default Editor;