import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
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
    id: 'events',
    label: 'Events',
    format: true,
    minWidth: 170,
  },
  {
    id: 'actions',
    label: '',
    minWidth: 200,  }
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
}));

const initialDialogStates = {
  delete: false,
  edit: false
}

export default function ProductsDataGrid() {
  const [{ products, events }, dispatch] = useContext(AppContext)
  const [page, setPage] =  useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [product, setProduct] = useState()
  const [dialog, setDialog] = useState(initialDialogStates);
  const classes = useStyles();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const handleInputChange = e => {
    setProduct({ ...product, [e.target.id]: e.target.value })
  }

  const handleAssignedEventChange = event => {
    const events = product.events.includes(event)
      ? product.events.filter(item => item !== event)
      : [...product.events, event]

    setProduct({ ...product, events })
  }

  const handleNewRecordClick = () => {
    const nextId = Math.max(...products.map(item => item.id)) + 1;
    const product = {
      id: nextId,
      name: '',
      displayName: '',
      description: '',
      catalogId: 'DEFAULT',
      events: []
    };
    setProduct(product)
    setDialog({ ...dialog, edit: true })
  }

  const handleEditClick = (rowData) => {
    setDialog({ ...dialog, edit: true })
    setProduct(rowData)
  }

  const handleDeleteClick = (rowData) => {
    setDialog({ ...dialog, delete: true })
    setProduct(rowData)
  }

  const handleOnSaveCancel = () => {
    setProduct()
    closeDialogs()
  }

  const handleOnSaveConfirm = () => {
    dispatch({
      type: actionTypes.CREATE_OR_UPDATE_PRODUCT,
      payload: product
    })

    closeDialogs()
  }

  const handleOnDeleteCancel = () => {
    setProduct()
    closeDialogs()
  }

  const handleOnDeleteConfirm = () => {
    dispatch({
      type: actionTypes.DELETE_PRODUCT,
      payload: product
    })
    setProduct()
    closeDialogs()
  }

  const closeDialogs = () => {
    setDialog(initialDialogStates)
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Toolbar>
          <Typography className={classes.title} variant="h6">
            Table of Products
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
            {products?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column, index) => {
                    const value = row[column.id];
                      return (column.id === 'actions') ? (
                        <TableCell key={index}>
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
                        <TableCell key={index} align={column.align}>
                          {
                            (column.format && Array.isArray(value))
                              ? value.map(val => <div key={val}>&bull; {val}</div>)
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
        count={products?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {(dialog.edit) && (
        <Dialog open onClose={closeDialogs}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="name"
                  label="Name"
                  fullWidth
                  size="small"
                  value={product?.name || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="displayName"
                  label="Display Name"
                  fullWidth
                  size="small"
                  value={product?.displayName || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="description"
                  label="Description"
                  fullWidth
                  size="small"
                  value={product?.description || ''}
                  variant="outlined"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <p>Assigned Events</p>
                {
                  events?.map(item => (
                    <div key={item.name}>
                      <Checkbox
                        checked={product?.events?.includes(item.name)}
                        onChange={() => handleAssignedEventChange(item.name)}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                      {item.displayName}
                    </div>
                  ))
                }
              </Grid>
            </Grid>
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
          <DialogTitle>Delete Product?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this product?
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
