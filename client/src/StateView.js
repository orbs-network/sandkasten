import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import ArrowRightIcon from '@material-ui/icons/ArrowRightAlt';

const styles = {
  root: {
    overflowX: 'auto',
  },
  oldValue: {
    fontWeight: 700,
    background: '#ac85b2',
    color: '#c1bfbf',
  },
  arrow: {
    position: 'relative',
    top: 9,
    left: 2
  },
  currentValueChip: {
    color: '#ededed',
    background: '#7b9e65',
    fontWeight: 700,
  },
};

function StateView(props) {
  const { classes, data = [] } = props;
  const emptyStateElem = (<TableRow><TableCell colspan={2} style={{ textAlign: 'center', color: '#a8a8a8' }}>State is empty</TableCell></TableRow>);
  let stateRepresentationElements;
  if (data.length > 0) { // We have state tries
    const previousState = data[data.length - 2];
    const currentState = data[data.length - 1];
    stateRepresentationElements = Object.keys(currentState).map((key, index) => {
      const value = currentState[key];
      let previousValue;
      let previousValueElem;

      if (previousState !== undefined) {
        // Get the field's previous state if it exists
        previousValue = previousState[key];
        previousValueElem = (
          <React.Fragment>
            <Chip className={classes.oldValue} label={previousValue} />
            <ArrowRightIcon className={classes.arrow} />
          </React.Fragment>
        );
      }

      return (
        <TableRow key={index}>
          <TableCell component="th" scope="row">{key}</TableCell>
          <TableCell align="right">{previousValueElem} <Chip className={classes.currentValueChip} label={value} /></TableCell>
        </TableRow>
      );
    });

  } else {
    stateRepresentationElements = emptyStateElem;
  }

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Prop</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stateRepresentationElements}
        </TableBody>
      </Table>
    </Paper>
  );
}

StateView.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object,
};

export default withStyles(styles)(StateView);