import { List } from '@material-ui/core';
import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FileIcon from '@material-ui/icons/RoundedCorner';
import AddCircle from '@material-ui/icons/AddCircle';

const FilesList = ({ files, onClick, onNew }) => {
  const renderItem = (fileData, fileIdx) => {
    return (
      <ListItem button key={fileData.name} onClick={() => onClick(fileIdx)}>
        <ListItemIcon>
          <FileIcon />
        </ListItemIcon>
        <ListItemText primary={fileData.name + '.go'} />
      </ListItem>
    );
  };
  return (
    <List>
      <div>
        {files.map(renderItem)}
        <ListItem button key='new' onClick={onNew}>
          <ListItemIcon>
            <AddCircle />
          </ListItemIcon>
          <ListItemText primary='New' />
        </ListItem>
      </div>
    </List>
  );
};

export default FilesList;
