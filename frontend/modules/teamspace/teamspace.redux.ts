import { createActions, createReducer } from 'reduxsauce';
import { Record, List, fromJS } from 'immutable';

export const { Types: MaintainersTypes, Creators: MaintainersActions } = createActions({
  fetch: ['language'],
  fetchSuccess: ['data'],
  fetchError: ['payload'],
}, { prefix: 'MAINTAINERS_' });

const MaintainersRecord = new Record({
  items: List(),
});

export const INITIAL_STATE = new MaintainersRecord({});

const getSuccessHandler = (state = INITIAL_STATE, action) => state.set('items', fromJS(action.data));

export const reducer = createReducer(INITIAL_STATE, {
  [MaintainersTypes.FETCH_SUCCESS]: getSuccessHandler,
});