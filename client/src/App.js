import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CodeIcon from '@material-ui/icons/Code';
import InspectorIcon from '@material-ui/icons/Dns';
import StateIcon from '@material-ui/icons/DeviceHub';
import MenuIcon from '@material-ui/icons/Menu';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import { mainListItems, secondaryListItems } from './listItems';
import StateView from './StateView';

import './App.css';
import axios from 'axios';
import Editor from './Editor';
import Inspector from './Inspector';
import ContractState from './ContractState';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  resultConsole: {
    background: '#303030',
    color: '#e8e8e8',
    fontWeight: 400,
    textAlign: 'left',
    padding: 8,
    margin: 16
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    padding: '4px 8px',
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  deployButton: {
    position: 'absolute',
    top: 16,
    right: 10,
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  iconCommon: {
    position: 'relative',
    top: 10,
    fontSize: 36,
  },
  stackMargin: {
    marginTop: 16,
  },
  h5: {
    marginBottom: theme.spacing.unit * 2,
  },
  dialogOverides: {
    maxWidth: 900,
  },
});

const basePath = (process.env.NODE_ENV === 'production') ? '/edge' : 'http://localhost:3030';

class App extends React.Component {
  state = {
    open: false,
    contractName: '',
    dialogOpen: false,
    lastDeploymentExecutionResult: '',
    deploymentError: '',
    ctaDisabled: false,
    contractState: [],
    methods: []
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
    this.setContractState(data.stateJson.result);
  }

  setContractState(contractState) {
    this.setState(Object.assign({}, this.state, { contractState }));
  }

  handleClose() {
    this.setState(Object.assign({}, this.state, { dialogOpen: false }));
  }

  setDeploymentResult({ ExecutionResult, OutputArguments }) {
    const deploymentError = OutputArguments[0].Value || '';

    const dialogOpen = (ExecutionResult === 'ERROR_SMART_CONTRACT' && deploymentError.length > 0) ?
      true : false;

    this.setState(Object.assign({}, this.state, {
      lastDeploymentExecutionResult: ExecutionResult,
      dialogOpen,
      deploymentError,
    }));
  }

  async deploymentHandler(code) {
    this.setDeployCTAStatus(true);
    const { data } = await axios.post(`${basePath}/api/deploy`, { data: code });

    this.setDeployCTAStatus(false);
    if (data.gammaResultJson.ExecutionResult === 'ERROR_SMART_CONTRACT') {
      this.setDeploymentResult(data.gammaResultJson);
    } else {
      const { contractName, stateJson, methods } = data;
      this.setContractName(contractName);
      this.setMethods(methods.map(m => ({ methodName: m.Name, args: m.Args })));
      this.setContractState(stateJson.result);
    }
  };

  render() {
    const { classes } = this.props;
    const {
      contractState,
      ctaDisabled,
      dialogOpen,
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
          <List>{mainListItems}</List>
          <Divider />
          <List>{secondaryListItems}</List>
        </Drawer>

        <Dialog
          maxWidth={'900px'}
          open={dialogOpen}
          onClose={this.handleClose.bind(this)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Contract Deployment Failed</DialogTitle>
          <DialogContent>
            <DialogContentText>
              We couldn't deploy your contract because of the following error(s):
              <Paper className={classes.resultConsole}>{deploymentError}</Paper>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)} color="primary">
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
                  <CodeIcon className={classes.iconCommon} /> Code
                </Typography>
                <hr />
                <Editor lastDeploymentExecutionResult={lastDeploymentExecutionResult} deploymentError={deploymentError} ctaDisabled={ctaDisabled} onDeploy={this.deploymentHandler.bind(this)} buttonClasses={classes.deployButton} />
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
