import React, { useContext, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
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
    id: 'dataType',
    label: 'Data Type',
    minWidth: 80,
  },
  {
    id: 'indexed',
    label: 'Indexed',
    minWidth: 80,
    format: true
  },
  {
    id: 'sortable',
    label: 'Sortable',
    minWidth: 80,
    format: true
  },
  {
    id: 'required',
    label: 'Required',
    minWidth: 80,
    format: true
  },
  {
    id: 'requestContext',
    label: 'Request Context',
    minWidth: 120,
    format: true
  },
  {
    id: 'constraints',
    label: 'Constraints',
    format: true
  },
  {
    id: 'actions',
    label: '',
    minWidth: 200
  }
];

const CONSTRAINTS = [
  {value: "anycaseenum", label: "ANYCASEENUM"},
  {value: "enum", label: "ENUM"},
  {value: "maxlength", label: "MAXLENGTH"},
  {value: "maxvalue", label: "MAXVALUE"},
  {value: "minlength", label: "MINLENGTH"},
  {value: "minvalue", label: "MINVALUE"},
  {value: "pattern", label: "PATTERN"},
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
  constraintButton: {
    minWidth: 0
  },
  select: {
    height: '2.4rem'
  },
}));

const initialDialogStates = {
  delete: false,
  edit: false
}

export default function AttributesDataGrid() {
  const [{ attributes }, dispatch] = useContext(AppContext)
  const [page, setPage] =  React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [attribute, setAttribute] = useState();
  const [constraint, setConstraint] = useState();
  const [dialog, setDialog] = useState(initialDialogStates);
  const classes = useStyles();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const handleEditClick = (rowData) => {
    setDialog({ ...dialog, edit: true })
    setAttribute(rowData)
  }

  const handleOnSaveCancel = () => {
    setAttribute();
    closeDialogs();
  }

  const handleOnSaveConfirm = () => {
    dispatch({
      type: actionTypes.CREATE_OR_UPDATE_ATTRIBUTE,
      payload: attribute
    })

    closeDialogs();
  }

  const handleDeleteClick = (rowData) => {
    setDialog({ ...dialog, delete: true })
    setAttribute(rowData)
  }

  const handleOnDeleteCancel = () => {
    setAttribute();
    closeDialogs();
  }

  const handleOnDeleteConfirm = () => {
    dispatch({
      type: actionTypes.DELETE_ATTRIBUTE,
      payload: attribute
    })
    setAttribute();
    closeDialogs();
  }

  const handleInputChange = e => {
    setAttribute({ ...attribute, [e.target.name]: e.target.value })
  }

  const handleNewRecordClick = () => {
    const nextId = Math.max(...attributes.map(item => item.id)) + 1;
    const attribute = {
      id: nextId,
      name: '',
      displayName: '',
      description: '',
      dataType: 'INT',
      indexed: false,
      sortable: false,
      required: false,
      requestContext: false,
      examples: null,
      aliases: [],
      constraints: [],
      catalogId: "DEFAULT",
    };
    setAttribute(attribute)
    setDialog({ ...dialog, edit: true })
  }

  const handleConstraintChange = e => {
    setConstraint({...constraint, [e.target.name]: e.target.value})
  }

  const handleAddConstraintClick = e => {
    const newConstraint = {
      constraintType: {
        name: constraint.name
      },
      value: constraint.value || ""
    }
    setAttribute({...attribute, constraints: [...attribute.constraints, newConstraint]});
    setConstraint()
  }

  const handleRemoveConstraintClick = name => {
    const constraints = attribute.constraints.filter(item => (item.constraintType.name !== name))
    setAttribute({ ...attribute, constraints });
  }

  const attributeConstraints = useMemo(() => {
    if (!attribute) return [];

    const constraintList = attribute?.constraints?.map(item => item.constraintType.name);
    return CONSTRAINTS.filter(item => constraintList?.includes(item.value) === false)
  }, [attribute])

  const closeDialogs = () => {
    setDialog(initialDialogStates)
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          Table of Attributes
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
            {attributes?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
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
                          {(column.format && Array.isArray(value)) && (value.map(val => (
                              <div>{val.constraintType.name}({val.value})</div>
                            ))
                          )}
                          {
                            column.format && typeof value === "boolean" && JSON.stringify(value)
                          }
                          {
                            !column.format && value
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
        count={attributes?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {(dialog.edit) && (
        <Dialog open onClose={closeDialogs}>
          <DialogTitle>Edit Attribute</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={attribute?.name || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="displayName"
                  label="Display Name"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={attribute?.displayName || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={attribute?.description || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={8}>
                Data Type
              </Grid>
              <Grid container item xs={4} justify="flex-end">
                <Select
                  className={classes.select}
                  fullWidth
                  name="dataType"
                  value={attribute.dataType}
                  variant="outlined"
                  onChange={handleInputChange}
                >
                  <MenuItem value="BIG_DECIMAL">BIG_DECIMAL</MenuItem>
                  <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                  <MenuItem value="DOUBLE">DOUBLE</MenuItem>
                  <MenuItem value="FLOAT">FLOAT</MenuItem>
                  <MenuItem value="INT">INT</MenuItem>
                  <MenuItem value="LIST">LIST</MenuItem>
                  <MenuItem value="LONG">LONG</MenuItem>
                  <MenuItem value="MAP">MAP</MenuItem>
                  <MenuItem value="STRING">STRING</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={8}>
                Indexed
              </Grid>
              <Grid container item xs={4} justify="flex-end">
                <Select
                  className={classes.select}
                  fullWidth
                  name="indexed"
                  value={attribute.indexed}
                  variant="outlined"
                  onChange={handleInputChange}
                >
                  <MenuItem value={true}>true</MenuItem>
                  <MenuItem value={false}>false</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={8}>
                Sortable
              </Grid>
              <Grid container item xs={4} justify="flex-end">
                <Select
                  className={classes.select}
                  fullWidth
                  name="sortable"
                  value={attribute.sortable}
                  variant="outlined"
                  onChange={handleInputChange}
                >
                  <MenuItem value={true}>true</MenuItem>
                  <MenuItem value={false}>false</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={8}>
                Required
              </Grid>
              <Grid container item xs={4} justify="flex-end">
                <Select
                  className={classes.select}
                  fullWidth
                  name="required"
                  value={attribute.required}
                  variant="outlined"
                  onChange={handleInputChange}
                >
                  <MenuItem value={true}>true</MenuItem>
                  <MenuItem value={false}>false</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={8}>
                Request Context
              </Grid>
              <Grid container item xs={4} justify="flex-end">
                <Select
                  className={classes.select}
                  fullWidth
                  name="requestContext"
                  value={attribute.requestContext}
                  variant="outlined"
                  onChange={handleInputChange}
                >
                  <MenuItem value={true}>true</MenuItem>
                  <MenuItem value={false}>false</MenuItem>
                </Select>
              </Grid>
            </Grid>
            <Divider orientation="horizontal" style={{margin: '1rem 0'}} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Assigned Constraints
                </Typography>
              </Grid>
                {attribute.constraints.map(item => (
                  <React.Fragment key={item.constraintType.name}>
                    <Grid item xs={11}>{item.constraintType.name}({item.value})</Grid>
                    <Grid item xs={1}>
                      <Button
                        className={classes.constraintButton}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleRemoveConstraintClick(item.constraintType.name)}
                      >
                        -
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}
            </Grid>
            <Divider orientation="horizontal" style={{margin: '1rem 0'}} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Add Constraint
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Select
                    className={classes.select}
                    fullWidth
                    name="name"
                    value={constraint?.name || ''}
                    variant="outlined"
                    onChange={handleConstraintChange}
                >
                  {(attributeConstraints?.map(item => (
                      <MenuItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  name="value"
                  label="Constraint Value"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={constraint?.value || ''}
                  onChange={handleConstraintChange}
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  className={classes.constraintButton}
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleAddConstraintClick}
                >
                  +
                </Button>
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