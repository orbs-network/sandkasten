import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = {
  root: {
    overflowX: 'auto',
  },
  table: {
  },
};

function StateView(props) {
  const { classes, data = [] } = props;
  const emptyStateElem = (<TableRow><TableCell colspan={2} style={{ textAlign: 'center', color: '#a8a8a8' }}>State is empty</TableCell></TableRow>);
  let stateRepresentationElements;
  if (data.length > 0) { // We have state tries
    const currentState = data[data.length - 1];
    stateRepresentationElements = Object.keys(currentState).map((key, index) => {
      const value = currentState[key];

      return (
        <TableRow key={index}>
          <TableCell component="th" scope="row">{key}</TableCell>
          <TableCell align="right">{value}</TableCell>
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