import { combineReducers } from 'redux-immutable';

import { reducer as routerReducer } from './router/router.redux';
import { reducer as localesReducer } from './locales/locales.redux';
import { reducer as maintainersReducer } from './maintainers/maintainers.redux';
//<-- IMPORT MODULE REDUCER -->

export default function createReducer() {
  return combineReducers({
    route: routerReducer,
    maintainers: maintainersReducer,
    locales: localesReducer,
    //<-- INJECT MODULE REDUCER -->
  });
