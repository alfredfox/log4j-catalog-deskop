import React, { useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
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

const read = callback => {
  const props =
    process.env.NODE_ENV === 'production'
      ? `${app
          .getAppPath()
          .replace(
            '/ElectronReact.app/Contents/Resources/app.asar',
            '/application.properties'
          )}`
      : 'application.properties.dev';
  try {
    const content = fs.readFileSync(props, 'UTF-8');

    //  parse application properties from string to json
    const json = content.split('\n').reduce((acc, curr) => {
      const [k, v] = curr.split('=');
      return {
        ...acc,
        [k]: v
      };
    }, {});

    return callback(json);
  } catch (error) {
    // /Users/moelubovac/Projects/fuck-shit/release/mac/ElectronReact.app/Contents/Resources/app.asar/application.properties
    alert(props);
    alert(JSON.stringify(error));
    // throw new Error(JSON.stringify(error));
  }
};

const useStyles = makeStyles(theme => ({
  fabRoot: {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    zIndex: 999
  }
}));

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tabIndex, setTabIndex] = React.useState(0);
  const classes = useStyles();

  const appContext = useMemo(() => [state, dispatch], [state, dispatch]);

  React.useEffect(() => {
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
      })
      .catch(error => console.log(error));
  }, [state.git, state.sha]);

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

  return (
    <AppContext.Provider value={appContext}>
      <Fab
        className={classes.fabRoot}
        color="secondary"
        size="medium"
        variant="outlined"
        onClick={handleSaveAllClick}
      >
        Save All Changes
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
