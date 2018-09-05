import { createActions, createReducer } from 'reduxsauce';

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetch: [],
	updateButtonText: ['value']
}, { prefix: 'TEAMSPACE_' });

export const INITIAL_STATE = {
	buttonText: 'Sample button'
};

const updateButtonText = (state = INITIAL_STATE, { value }) => {
	return Object.assign({}, { buttonText: value });
};

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspaceTypes.UPDATE_BUTTON_TEXT]: updateButtonText
});
