import { createContext } from 'react';

const initialState = {
  git: null,
  sha: '',
  products: [],
  categories: [],
  events: [],
  attributes: []
};

const actionTypes = {
  SET_GIT_CREDENTIALS: 'SET_GIT_CREDENTIALS',
  GET_CATALOG: 'GET_CATALOG',
  CREATE_OR_UPDATE_PRODUCT: 'CREATE_OR_UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  CREATE_OR_UPDATE_CATEGORY: 'CREATE_OR_UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  CREATE_OR_UPDATE_EVENT: 'CREATE_OR_UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  CREATE_OR_UPDATE_ATTRIBUTE: 'CREATE_OR_UPDATE_ATTRIBUTE',
  DELETE_ATTRIBUTE: 'DELETE_ATTRIBUTE',
  SET_SHA: 'SET_SHA'
};

const AppContext = createContext(initialState);

export { AppContext };
export { initialState };
export { actionTypes };
