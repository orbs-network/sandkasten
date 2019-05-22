import React, { useCallback } from 'react';
import { editor } from 'monaco-editor';
import { counter } from './contracts/counter';
import axios from 'axios';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

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
    const data = e.getValue();
    axios.post(`${basePath}/api/deploy`, {data}).then((res) => {
      console.log(res);
    });
  };

  return (
    <div>
      <button onClick={deployHandler}>Deploy</button>
      <article ref={editorRef} style={{ height: 600 }}></article>
    </div>
  )
};
export default Editor;