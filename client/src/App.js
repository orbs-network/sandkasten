import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CodeIcon from '@material-ui/icons/Code';
import InspectorIcon from '@material-ui/icons/Dns';
import StateIcon from '@material-ui/icons/DeviceHub';
import MenuIcon from '@material-ui/icons/Menu';
import NotesIcon from '@material-ui/icons/Notes';
import EventsStreamView from './EventsStreamView';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import StateView from './StateView';
import styles from './App.style';

import './App.css';
import axios from 'axios';
import Editor from './Editor';
import Inspector from './Inspector';
import FilesList from './FilesList';

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

class App extends React.Component {
  state = {
    open: true,
    contractName: '',
    dialogOpen: false,
    testDialogOpen: false,
    testOutput: '',
    testPassed: false,
    lastDeploymentExecutionResult: '',
    deploymentError: '',
    ctaDisabled: false,
    contractState: [],
    contractEvents: [],
    methods: [],
    files: {},
    currentFile: {
      name: '',
      code: ''
    }
  };

  setContractName(contractName) {
    this.setState(Object.assign({}, this.state, { contractName }));
  }

  handleDrawerOpen = () => {
    this.setState(Object.assign({}, this.state, { open: true }));
  };

  setDeployCTAStatus(newStatus) {
    this.setState(Object.assign({}, this.state, { ctaDisabled: newStatus }));
  }

  handleDrawerClose = () => {
    this.setState(Object.assign({}, this.state, { open: false }));
  };

  setMethods(methods) {
    this.setState(Object.assign({}, this.state, { methods }));
  }

  onSetContractStateForInspector(data) {

    if (data.ok) {
      this.setContractState(data.stateJson.result);
      this.setContractEvents(data.eventsJson.result);
    } else {
      const deploymentError = data.result.stderr;
      const dialogTitle = "Contract Execution Failed";
      const dialogOpen = true;

      this.setState(Object.assign({}, this.state, {
        lastDeploymentExecutionResult: "FooBar",
        dialogOpen,
        deploymentError,
        dialogTitle,
      }));
    }

  }

  setContractState(contractState) {
    this.setState(Object.assign({}, this.state, { contractState }));
  }

  setContractEvents(contractEvents) {
    this.setState(Object.assign({}, this.state, { contractEvents }));
  }

  handleClose() {
    this.setState(Object.assign({}, this.state, { dialogOpen: false }));
  }

  handleTestClose() {
    this.setState(Object.assign({}, this.state, { testDialogOpen: false }));
  }

  setDeploymentResult({ ExecutionResult, OutputArguments }) {
    const deploymentError = OutputArguments[0].Value || '';
    const dialogTitle = "Contract Deployment Failed";

    const dialogOpen = (ExecutionResult === 'ERROR_SMART_CONTRACT' && deploymentError.length > 0) ?
      true : false;

    this.setState(Object.assign({}, this.state, {
      lastDeploymentExecutionResult: ExecutionResult,
      dialogOpen,
      deploymentError,
      dialogTitle,
    }));
  }

  async deploymentHandler(code) {
    await this.saveHandler(code);
    this.setDeployCTAStatus(true);
    const { currentFile } = this.state;
    const { data } = await axios.post(`${basePath}/api/deploy/${currentFile.name}`, { data: code });

    this.setDeployCTAStatus(false);
    if (data.gammaResultJson.ExecutionResult === 'ERROR_SMART_CONTRACT') {
      this.setDeploymentResult(data.gammaResultJson);
    } else {
      const { contractName, stateJson, methods, eventsJson } = data;
      this.setContractName(contractName);
      this.setContractEvents(eventsJson.result);
      this.setMethods(methods.map(m => ({ methodName: m.Name, args: m.Args })));
      this.setContractState(stateJson.result);
    }
  };

  async saveHandler(code) {
    const newState = { ...this.state };
    newState.currentFile.code = code;
    await axios.post(`${basePath}/api/files/${newState.currentFile.name}`, { data: newState.currentFile.code });
  }


  async testHandler() {
    const {data} = await axios.post(`${basePath}/api/test/${this.state.currentFile.name}`);
    this.setState(Object.assign({}, this.state, {
      testOutput: data.output,
      testDialogOpen: true,
      testPassed: data.allTestsPassed
    }));
    console.log(data);
  }

  fileClickHandler(fileName) {
    const newState = { ...this.state };
    newState.currentFile = this.state.files[fileName];
    this.setState(newState);
  }

  createNewFileHandler() {
    const fileName = prompt('Please enter the file name');
    console.log(fileName);
    const newState = { ...this.state };
    const newFile = {
      name: fileName,
      code: ''
    };
    newState.currentFile = newFile;
    newState.files[fileName] = newFile;
    this.setState(newState);
  }

  async componentDidMount() {
    const { data } = await axios.get(`${basePath}/api/files`);
    const newState = { ...this.state };
    newState.files = data;
    newState.currentFile = data['Counter'];
    this.setState(newState);
  }

  render() {
    const { classes } = this.props;
    const {
      contractState,
      contractEvents,
      ctaDisabled,
      dialogOpen,
      dialogTitle,
      lastDeploymentExecutionResult,
      deploymentError } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden,
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              örbs Sandkasten
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <FilesList onNew={this.createNewFileHandler.bind(this)} onClick={this.fileClickHandler.bind(this)} files={this.state.files} />
        </Drawer>

        <Dialog
          maxWidth={'900px'}
          open={dialogOpen}
          onClose={this.handleClose.bind(this)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Achtung! {dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ein Fehler ist aufgetreten:
              <Paper className={classes.resultConsole}>{deploymentError}</Paper>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)} color="primary">
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          maxWidth={'900px'}
          open={this.state.testDialogOpen}
          onClose={this.handleTestClose.bind(this)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Test Results</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Paper className={classes.resultConsole}>
                Passed: {this.state.testPassed.toString()} <br />
                Output: {this.state.testOutput}
              </Paper>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleTestClose.bind(this)} color="primary">
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Grid container spacing={24}>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <Typography variant="h5" component="h3">
                  <CodeIcon className={classes.iconCommon} /> {this.state.currentFile.name}
                </Typography>
                <hr />
                <Editor
                  onSave={this.saveHandler.bind(this)}
                  onTest={this.testHandler.bind(this)}
                  file={this.state.currentFile}
                  lastDeploymentExecutionResult={lastDeploymentExecutionResult}
                  deploymentError={deploymentError}
                  ctaDisabled={ctaDisabled}
                  onDeploy={this.deploymentHandler.bind(this)}
                  buttonClasses={classes} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <Typography variant="h5" component="h3">
                  <InspectorIcon className={classes.iconCommon} /> Inspector
                </Typography>
                <hr />
                <Inspector onUpdateStateView={this.onSetContractStateForInspector.bind(this)} contractName={this.state.contractName} methods={this.state.methods} />
              </Paper>

              <Paper className={classNames(classes.paper, classes.stackMargin)}>
                <Typography variant="h5" component="h3">
                  <StateIcon className={classes.iconCommon} /> State view
                </Typography>
                <hr />
                <StateView data={contractState}></StateView>
              </Paper>

              <Paper className={classNames(classes.paper, classes.stackMargin)}>
                <Typography variant="h5" component="h3">
                  <NotesIcon className={classes.iconCommon} /> Events
                </Typography>
                <hr />
                <EventsStreamView data={contractEvents}></EventsStreamView>
              </Paper>
            </Grid>
          </Grid>
        </main>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
