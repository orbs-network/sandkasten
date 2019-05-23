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
        marginLeft: 5,
        marginRight: 5,
        background: '#7b9e65',
        fontWeight: 700,
    },
};

function EventsStreamView(props) {
    const { classes, data = [] } = props;

    const emptyEventsElem = (<TableRow><TableCell colSpan={2} style={{ textAlign: 'center', color: '#a8a8a8' }}>No events to show currently</TableCell></TableRow>);
    let eventsRepresentationElements;

    if (data.length > 0) { // We have events!
        eventsRepresentationElements = data.map((item, index) => {
            return (
                <TableRow key={index}>
                    <TableCell component="th" scope="row">{item.FunctionName}</TableCell>
                    <TableCell align="right">{item.Args.map(arg => (<Chip className={classes.currentValueChip} label={arg} />))}</TableCell>
                </TableRow>
            );
        });
    } else {
        eventsRepresentationElements = emptyEventsElem;
    }

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Function Name</TableCell>
                        <TableCell align="right">Arguments</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eventsRepresentationElements}
                </TableBody>
            </Table>
        </Paper>
    );
}

EventsStreamView.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
};

export default withStyles(styles)(EventsStreamView);