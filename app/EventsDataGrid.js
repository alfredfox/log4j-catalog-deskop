import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { AppContext, actionTypes } from './AppContext';

const columns = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 170
  },
  {
    id: 'displayName',
    label: 'Display Name',
    minWidth: 100
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 170,
  },
  {
    id: 'attributes',
    label: 'Assigned Attributes',
    minWidth: 170,
    format: true
  },
  {
    id: 'actions',
    label: '',
    minWidth: 200
  }
];

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: 850,
    overflow: 'auto',
  },
  title: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  attributeButton: {
    minWidth: 0
  },
  select: {
    height: '2.4rem'
  }
}));

const initialDialogStates = {
  delete: false,
  edit: false
}

export default function EventsDataGrid() {
  const [{ events, attributes }, dispatch] = useContext(AppContext)
  const [page, setPage] =  React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [event, setEvent] = useState();
  const [attribute, setAttribute] = useState('');
  const [dialog, setDialog] = useState(initialDialogStates);
  const classes = useStyles();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const handleNewRecordClick = () => {
    const nextId = Math.max(...events.map(item => item.id)) + 1;
    const event = {
      id: nextId,
      name: '',
      displayName: '',
      description: '',
      aliases: [],
      attributes: []
    };

    setEvent(event)
    setDialog({ ...dialog, edit: true })
  }

  const handleDeleteClick = (rowData) => {
    setDialog({ ...dialog, delete: true })
    setEvent(rowData)
  }

  const handleEditClick = (rowData) => {
    setDialog({ ...dialog, edit: true })
    setEvent(rowData)
  }

  const handleInputChange = e => {
    setEvent({ ...event, [e.target.id]: e.target.value })
  }

  const handleSelectChange = e => {
    setAttribute(e.target.value)
  }

  const handleAddAttributeClick = () => {
    const newAttribute = {
      name: attribute,
      required: false,
    }

    setEvent({...event, attributes: [...event.attributes, newAttribute]});
  }

  const handleRemoveAttributeClick = name => {
    const attributes = event.attributes.filter(item => (item.name !== name))
    setEvent({ ...event, attributes });
  }

  const handleItemRequiredClick = (name, required) => {
    const attributes = event.attributes.map(item => {
      if (item.name === name) {
        return {
          ...item,
          required
        }
      }
      return item;
    })
    setEvent({...event, attributes});
  }

  const handleOnSaveCancel = () => {
    setEvent();
    closeDialogs();
  }

  const handleOnSaveConfirm = () => {

    dispatch({
      type: actionTypes.CREATE_OR_UPDATE_EVENT,
      payload: event
    })

    closeDialogs();
  }

  const handleOnDeleteCancel = () => {
    setEvent();
    closeDialogs();
  }

  const handleOnDeleteConfirm = () => {
    dispatch({
      type: actionTypes.DELETE_EVENT,
      payload: event
    })
    setEvent();
    closeDialogs();
  }

  const availableAttributes = React.useMemo(() => {
    const assignedAttributesList = event?.attributes.map(item => item.name)
    return attributes.filter(item => assignedAttributesList?.includes(item.name) === false)
  }, [event, attributes])

  const closeDialogs = () => {
    setDialog(initialDialogStates)
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          Table of Events
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleNewRecordClick}
        >
          Add new record
        </Button>
      </Toolbar>
        <Table stickyHeader aria-label="sticky table" height="80vh">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map(column => {
                    const value = row[column.id];
                      return (column.id === 'actions') ? (
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={(e) => handleEditClick(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            className={classes.button}
                            onClick={(e) => handleDeleteClick(row)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      ) : (
                        <TableCell key={column.id} align={column.align}>
                          {
                            (column.format && Array.isArray(value))
                              ? value.map(val => <div key={val.name}>&bull; {val.name} {val.required ? '(required)' : ''}</div>)
                              : value
                          }
                        </TableCell>
                      )
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={events?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {(dialog.edit) && (
        <Dialog open onClose={closeDialogs}>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Name"
                  size="small"
                  value={event?.name || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="displayName"
                  label="Display Name"
                  size="small"
                  value={event?.displayName || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Description"
                  size="small"
                  value={event?.description || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
            <Divider orientation="horizontal" style={{margin: '1rem 0'}} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Assigned Attributes
                  </Typography>
                </Grid>
                {event?.attributes?.map(item => (
                  <>
                    <Grid item xs={7}>{item.name}</Grid>
                    <Grid item xs={2}>
                      <Checkbox
                        checked={item.required}
                        onChange={() => handleItemRequiredClick(item.name, true)}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                      Yes
                    </Grid>
                    <Grid item xs={2}>
                      <Checkbox
                        checked={!item.required}
                        onChange={() => handleItemRequiredClick(item.name, false)}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                      No
                    </Grid>
                    <Grid item xs={1}>
                      <div style={{textAlign: 'right'}}>
                        <Button
                          className={classes.attributeButton}
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleRemoveAttributeClick(item.name)}
                        >
                          -
                        </Button>
                      </div>
                    </Grid>
                  </>
                ))}
            </Grid>
            <Divider orientation="horizontal" style={{margin: '1rem 0'}} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Available Attributes
                </Typography>
              </Grid>
              <Grid item xs={11}>
                <Select
                  className={classes.select}
                  label="Available Attributes"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={attribute}
                  onChange={handleSelectChange}
                >
                  {availableAttributes.map(item => (<MenuItem value={item.name}>{item.name}</MenuItem>))}
                </Select>
              </Grid>
              <Grid item xs={1}>
                <div style={{textAlign: 'right'}}>
                  <Button
                    className={classes.attributeButton}
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleAddAttributeClick}
                  >
                    +
                  </Button>
                </div>
              </Grid>
            </Grid>
            <Divider orientation="horizontal" style={{margin: '1rem 0'}} />
            <DialogActions>
              <Button onClick={handleOnSaveCancel} variant="contained">
                Cancel
              </Button>
              <Button
                onClick={handleOnSaveConfirm}
                color="primary"
                variant="contained"
              >
                Save
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
      {(dialog.delete) && (
        <Dialog
          open
          onClose={closeDialogs}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>Delete Event?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this event?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleOnDeleteCancel}
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOnDeleteConfirm}
              color="secondary"
              variant="contained"
              autoFocus
            >
              Yes, delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}