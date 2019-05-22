import React, { useCallback } from 'react';
import { editor } from 'monaco-editor';
import { counter } from './contracts/counter';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

const Editor = ({ onDeploy, buttonClasses, ctaDisabled = false, lastDeploymentExecutionResult = '', deploymentError = '' }) => {
  let e;
  const editorRef = useCallback(node => {
    if (node !== null) {
      e = editor.create(node, {
        value: counter,
        language: 'go'
      })
    }
  }, []);

  const deployHandler = (event) => {
    onDeploy(e.getValue());
  };

  return (
    <React.Fragment>
      {ctaDisabled && <LinearProgress />}
      <Button disabled={ctaDisabled} className={buttonClasses} variant="contained" color="primary" onClick={deployHandler}>Deploy</Button>
      <article ref={editorRef} style={{ marginTop: 16, height: 580 }}></article>
    </React.Fragment>
  )
};
export default Editor;