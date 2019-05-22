import React, { useCallback } from 'react';
import { editor } from 'monaco-editor';
import { counter } from './contracts/counter';

const Editor = () => {
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
    console.log(e.getValue());
  };

  return (
    <div>
      <button onClick={deployHandler}>Deploy</button>
      <article ref={editorRef} style={{ height: 600 }}></article>
    </div>
  )
};
export default Editor;