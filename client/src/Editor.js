import React from 'react';
import { editor } from 'monaco-editor';
import { counter } from './contracts/counter';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

class Editor extends React.Component {
  constructor() {
    super();
    this.editorRef = React.createRef();
  }
  deployHandler() {
    this.props.onDeploy(this.editorInstance.getValue());
  }

  componentDidMount() {
    this.editorInstance = editor.create(this.editorRef.current, {
      value: counter,
      language: 'go'
    })
  }
  render() {
    const ctaDisabled = this.props.ctaDisabled || false;
    const buttonClasses = this.props.buttonClasses;
    return (
      <React.Fragment>
        {ctaDisabled && <LinearProgress />}
        <Button 
          disabled={ctaDisabled} 
          className={buttonClasses} 
          variant="contained" 
          color="primary" 
          onClick={this.deployHandler.bind(this)}
        >Deploy</Button>
        <article ref={this.editorRef} style={{ marginTop: 16, height: 580 }}></article>
      </React.Fragment>
    )
  }
}

export default Editor;