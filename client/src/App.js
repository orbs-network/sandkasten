import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CodeIcon from '@material-ui/icons/Code';
import StateIcon from '@material-ui/icons/DeviceHub';
import InspectorIcon from '@material-ui/icons/Dns';
import MenuIcon from '@material-ui/icons/Menu';
import NotesIcon from '@material-ui/icons/Notes';
import axios from 'axios';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import './App.css';
import styles from './App.style';
import { counterCode } from './contracts/counter';
import { erc20Code } from './contracts/erc20';
import Editor from './Editor';
import EventsStreamView from './EventsStreamView';
import FilesList from './FilesList';
import Inspector from './Inspector';
import StateView from './StateView';

const basePath =
  process.env.NODE_ENV === 'production' ? '/edge' : 'http://localhost:3030';

class App extends React.Component {
  constructor(props) {
    super(props);

    const files = this.loadFiles();
    this.state = {
      open: true,
      contractName: '',
      users: [],
      dialogOpen: false,
      testDialogOpen: false,
      testOutput: '',
      signer: 1,
      testPassed: false,
      lastDeploymentExecutionResult: '',
      deploymentError: '',
      ctaDisabled: false,
      contractState: [],
      contractEvents: [],
      methods: [],
      files,
      currentFile: files[0]
    };
  }
  componentWillMount() {
    this.getGammaUsers();
  }

  setContractName(contractName) {
    this.setState(Object.assign({}, this.state, { contractName }));
  }

  handleDropdownChange = event => {
    this.setState(
      Object.assign({}, this.state, { [event.target.name]: event.target.value })
    );
  };

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
      const dialogTitle = 'Contract Execution Failed';
      const dialogOpen = true;

      this.setState(
        Object.assign({}, this.state, {
          lastDeploymentExecutionResult: 'FooBar',
          dialogOpen,
          deploymentError,
          dialogTitle
        })
      );
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

  setDeploymentResult(deploymentError) {
    const dialogTitle = 'Contract Deployment Failed';
    const dialogOpen = deploymentError.length > 0;

    this.setState(
      Object.assign({}, this.state, {
        lastDeploymentExecutionResult: 'ERROR_SMART_CONTRACT',
        dialogOpen,
        deploymentError,
        dialogTitle
      })
    );
  }

  async getGammaUsers() {
    const { data } = await axios.get(`${basePath}/api/users`);
    const { users } = data;
    this.setState(Object.assign({}, this.state, { users }));
  }

  async deploymentHandler(code) {
    await this.saveHandler(code);
    this.setDeployCTAStatus(true);
    const { currentFile } = this.state;
    const { data } = await axios.post(
      `${basePath}/api/deploy/${currentFile.name}`,
      { data: code }
    );

    this.setDeployCTAStatus(false);
    if (!data.ok) {
      this.setDeploymentResult(data.deploymentError);
    } else {
      const { contractName, stateJson, methods, eventsJson } = data;
      this.setContractName(contractName);
      this.setContractEvents(eventsJson.result);
      this.setMethods(methods.map(m => ({ methodName: m.Name, args: m.Args })));
      this.setContractState(stateJson.result);
    }
  }

  async saveHandler(code) {
    const newState = { ...this.state };
    newState.currentFile.code = code;
    this.setState(newState);
    this.saveFiles();
  }

  async testHandler(code) {
    await this.saveHandler(code);
    const { data } = await axios.post(
      `${basePath}/api/test/${this.state.currentFile.name}`
    );
    this.setState(
      Object.assign({}, this.state, {
        testOutput: data.output,
        testDialogOpen: true,
        testPassed: data.allTestsPassed
      })
    );
    console.log(data);
  }

  fileClickHandler(fileIdx) {
    const newState = { ...this.state };
    newState.currentFile = this.state.files[fileIdx];
    newState.methods = [];
    newState.contractState = [];
    newState.contractEvents = [];
    newState.contractName = '';
    this.setState(newState);
  }

  saveFiles() {
    localStorage.setItem(`user_files`, JSON.stringify(this.state.files));
  }

  loadFiles() {
    const defaultFiles = [
      {
        name: 'Counter',
        code: counterCode
      },
      {
        name: 'ERC20',
        code: erc20Code
      }
    ];

    const savedFiles = localStorage.getItem(`user_files`);
    return savedFiles ? JSON.parse(savedFiles) : defaultFiles;
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
    newState.files.push(newFile);
    this.setState(newState);
    this.saveFiles();
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
      deploymentError
    } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position='absolute'
          className={classNames(
            classes.appBar,
            this.state.open && classes.appBarShift
          )}
        >
          <Toolbar
            disableGutters={!this.state.open}
            className={classes.toolbar}
          >
            <IconButton
              color='inherit'
              aria-label='Open drawer'
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component='h1'
              variant='h6'
              color='inherit'
              noWrap
              className={classes.title}
            >
              Orbs Playground
            </Typography>
          </Toolbar>
          <FormControl className={classes.formControl}>
            <Select
              className={classes.signerSelect}
              value={this.state.signer}
              onChange={this.handleDropdownChange}
              inputProps={{
                name: 'signer',
                id: 'signer'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((user, idx) => {
                return <MenuItem value={user} key={idx}>user{user}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </AppBar>
        <Drawer
          variant='permanent'
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !this.state.open && classes.drawerPaperClose
            )
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <FilesList
            onNew={this.createNewFileHandler.bind(this)}
            onClick={this.fileClickHandler.bind(this)}
            files={this.state.files}
          />
        </Drawer>

        <Dialog
          maxWidth={'md'}
          open={dialogOpen}
          onClose={this.handleClose.bind(this)}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Error! {dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              An error has occurred:
              <Paper className={classes.resultConsole}>{deploymentError}</Paper>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)} color='primary'>
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          maxWidth={'lg'}
          open={this.state.testDialogOpen}
          onClose={this.handleTestClose.bind(this)}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Test Results</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.testPassed ? 'Tests passed' : 'Test failure'}: <br />
              <Paper className={classes.resultConsole}>
                <pre>Output: {this.state.testOutput}</pre>
              </Paper>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleTestClose.bind(this)} color='primary'>
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Grid container spacing={24}>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <Typography variant='h5' component='h3'>
                  <CodeIcon className={classes.iconCommon} />{' '}
                  {this.state.currentFile.name}
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
                  buttonClasses={classes}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <Typography variant='h5' component='h3'>
                  <InspectorIcon className={classes.iconCommon} /> Inspector
                </Typography>
                <hr />
                <Inspector
                  onUpdateStateView={this.onSetContractStateForInspector.bind(
                    this
                  )}
                  contractName={this.state.contractName}
                  methods={this.state.methods}
                  signer={this.state.signer}
                  users={this.state.users}
                />
              </Paper>

              <Paper className={classNames(classes.paper, classes.stackMargin)}>
                <Typography variant='h5' component='h3'>
                  <StateIcon className={classes.iconCommon} /> State view
                </Typography>
                <hr />
                <StateView data={contractState} />
              </Paper>

              <Paper className={classNames(classes.paper, classes.stackMargin)}>
                <Typography variant='h5' component='h3'>
                  <NotesIcon className={classes.iconCommon} /> Events
                </Typography>
                <hr />
                <EventsStreamView data={contractEvents} />
              </Paper>
            </Grid>
          </Grid>
        </main>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
