import { createActions, createReducer } from 'reduxsauce';

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetch: ['language'],
	fetchSuccess: ['data'],
	fetchError: ['payload']
}, { prefix: 'MAINTAINERS_' });

export const INITIAL_STATE = {};

export const reducer = createReducer(INITIAL_STATE, {});
