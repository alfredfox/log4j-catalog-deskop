import React, { useEffect, useMemo, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

import AttributesDataGrid from './AttributesDataGrid';
import CategoriesDataGrid from './CategoriesDataGrid';
import EventsDataGrid from './EventsDataGrid';
import ProductsDataGrid from './ProductsDataGrid';

import { AppContext, initialState, actionTypes } from './AppContext';
import { reducer } from './reducer';

const fs = window.require('fs');
const { app } = window.require('electron').remote;

function TabPanel(props) {
  const { children, value, index } = props;

  return value === index && <Box p={1}>{children}</Box>;
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

const initialErrorState = {
  accessToken: false,
  catalogPath: false,
  repository: false,
  username: false,
};

const useStyles = makeStyles(theme => ({
  authForm: {
    padding: 24,
  },
  fabRootSave: {
    position: 'absolute',
    top: '0.25rem',
    right: '7.25rem',
    zIndex: 999
  },
  fabRootLogout: {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    zIndex: 999
  }
}));


export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [authDetails, setAuthDetails] = useState({});
  const [errors, setErrors] = useState(initialErrorState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = React.useState(0);
  const classes = useStyles();

  const appContext = useMemo(() => [state, dispatch], [state, dispatch]);

  const read = callback => {
    const gitAuth = JSON.parse(localStorage.getItem('gitAuth'));

    if (gitAuth) {
      return callback(gitAuth);
    }

    setIsAuthenticated(false);
    setIsLoading(false);
  };

  useEffect(() => {
    read(result => {
      dispatch({
        type: actionTypes.SET_GIT_CREDENTIALS,
        payload: result
      });
    });
  }, []);

  useEffect(() => {
    if (!state.git) return;

    axios
      .get(
        `https://api.github.com/repos/${state.git.username}/${state.git.repository}/contents/${state.git.catalogPath}`,
        {
          headers: {
            Authorization: `Basic ${btoa(state.git.accessToken)}`
          }
        }
      )
      .then(({ data }) => {
        const { products, categories, events, attributes } = JSON.parse(
          atob(data.content)
        );

        dispatch({
          type: actionTypes.GET_CATALOG,
          payload: {
            sha: data.sha,
            products,
            categories,
            events,
            attributes
          }
        });
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(error => {
        setIsAuthenticated(false);
        console.log(error, 'api call failed');
      });
  }, [state.git, state.sha]);

  const handleClearAuth = () => {
    localStorage.removeItem('gitAuth');
    dispatch({
      type: actionTypes.SET_GIT_CREDENTIALS,
      payload: {}
    });
  }

  const handleInputChange = e => {
    setAuthDetails({ ...authDetails, [e.target.name]: e.target.value })
    if (e.target.value === '') {
      setErrors({ ...errors, [e.target.name]: true });
    } else {
      setErrors({ ...errors, [e.target.name]: false });
    }
  }

  const handleSaveAuthClick = () => {
    if (Object.values(errors).indexOf(true) > -1) {
      alert('Please fix all form errors before proceeding');
    } else if (!authDetails?.accessToken, !authDetails?.catalogPath, !authDetails?.repository, !authDetails?.username) {
      alert('Please fill out all fields before proceeding');
    } else {
      localStorage.setItem('gitAuth', JSON.stringify(authDetails));
      location.reload();
    }
  }

  const handleSaveAllClick = e => {
    const { products, categories, events, attributes } = state;
    axios
      .put(
        `https://api.github.com/repos/${state.git.username}/${state.git.repository}/contents/${state.git.catalogPath}`,
        {
          message: 'updating...',
          content: btoa(
            JSON.stringify({ products, categories, events, attributes })
          ),
          sha: state.sha
        },
        {
          headers: {
            Authorization: `Basic ${btoa(state.git.accessToken)}`
          }
        }
      )
      .then(response => {
        dispatch({
          type: actionTypes.SET_SHA,
          payload: response.data.content.sha
        });
      })
      .catch(error => console.log(error));
  };

  const handleTabChange = (event, index) => {
    setTabIndex(index);
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className={classes.authForm}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <p><b>Unable to connect... Please enter the repsitory details for your catalog.json file</b></p>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="catalogPath"
              error={errors.catalogPath}
              helperText={errors.catalogPath && "Please enter the path to your catalog.json file in your repository."}
              label="Catalog Path (E.g. audit-service-api/src/main/resources/catalog.json)"
              fullWidth
              size="small"
              variant="outlined"
              value={authDetails?.catalogPath || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="repository"
              label="Repository (E.g. logging-log4j-audit-sample)"
              error={errors.repository}
              helperText={errors.repository && "Please enter the name of your repository."}
              fullWidth
              size="small"
              variant="outlined"
              value={authDetails?.repository || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="username"
              label="Username"
              error={errors.username}
              helperText={errors.username && "Please enter your username."}
              fullWidth
              size="small"
              variant="outlined"
              value={authDetails?.username || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="accessToken"
              label="Password or AccessToken"
              error={errors.accessToken}
              helperText={errors.accessToken && "Please enter your password or access token."}
              fullWidth
              type="password"
              size="small"
              variant="outlined"
              value={authDetails?.accessToken || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={handleSaveAuthClick}
              variant="contained"
            >
              Save & Connect
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <AppContext.Provider value={appContext}>
      <Fab
        className={classes.fabRootSave}
        color="secondary"
        size="medium"
        variant="outlined"
        onClick={handleSaveAllClick}
      >
        Save All Changes
      </Fab>
      <Fab
        className={classes.fabRootLogout}
        size="medium"
        variant="outlined"
        onClick={handleClearAuth}
      >
        Logout
      </Fab>
      <Grid container>
        <Grid item xs={12}>
          <AppBar position="static">
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Products" />
              <Tab label="Categories" />
              <Tab label="Events" />
              <Tab label="Attributes" />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={tabIndex} index={0}>
            <ProductsDataGrid />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <CategoriesDataGrid />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <EventsDataGrid />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <AttributesDataGrid />
          </TabPanel>
        </Grid>
      </Grid>
    </AppContext.Provider>
  );
}
