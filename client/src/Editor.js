import React from 'react';
import { editor } from 'monaco-editor';
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

  saveHandler() {
    this.props.onSave(this.editorInstance.getValue());
  }

  testHandler() {
    this.props.onTest(this.editorInstance.getValue());
  }

  componentDidMount() {
    this.editorInstance = editor.create(this.editorRef.current, {
      value: this.props.file.code,
      language: 'go'
    });
  }

  componentDidUpdate() {
    this.editorInstance.setValue(this.props.file.code);
  }

  render() {
    const ctaDisabled = this.props.ctaDisabled || false;
    const buttonClasses = this.props.buttonClasses;
    return (
      <React.Fragment>
        {ctaDisabled && <LinearProgress />}
        <Button
          className={buttonClasses.saveButton}
          variant='contained'
          color='secondary'
          onClick={this.saveHandler.bind(this)}
        >
          Save
        </Button>
        {!this.props.file.name.endsWith('_test') && (
          <Button
            disabled={ctaDisabled}
            className={buttonClasses.deployButton}
            variant='contained'
            color='primary'
            onClick={this.deployHandler.bind(this)}
          >
            Deploy
          </Button>
        )}
        {this.props.file.name.endsWith('_test') && (
          <Button
            onClick={this.testHandler.bind(this)}
            disabled={ctaDisabled}
            className={buttonClasses.deployButton}
            variant='contained'
            color='primary'
          >
            Test
          </Button>
        )}
        <article ref={this.editorRef} style={{ marginTop: 16, height: 580 }} />
      </React.Fragment>
    );
  }
}

export default Editor;
