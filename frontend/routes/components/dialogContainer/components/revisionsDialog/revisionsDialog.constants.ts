export const TYPES = {
	TEAMSPACES: 'teamspaces-revisions',
	VIEWER: 'viewer-revisions',
};

export const MAKE_VOID_NAME = 'make-void';
export const MAKE_VOID_LABEL = 'Make void';

export const MAKE_ACTIVE_NAME = 'make-active';
export const MAKE_ACTIVE_LABEL = 'Make active';

export const SET_LATEST_NAME = 'set-latest';
export const SET_LATEST_LABEL = 'Set latest';

const makeActiveAction = {
	name: MAKE_ACTIVE_NAME,
	label: MAKE_ACTIVE_LABEL
};

const makeVoidAction = {
	name: MAKE_VOID_NAME,
	label: MAKE_VOID_LABEL
};

const setLatestAction = {
	name: SET_LATEST_NAME,
	label: SET_LATEST_LABEL
};

export const VOID_ACTIONS = [
	makeActiveAction,
	setLatestAction
];

export const ACTIVE_ACTIONS = [
	makeVoidAction,
	setLatestAction
];
