export const DIFF_COMPARE_TYPE = 'diff';
export const CLASH_COMPARE_TYPE = 'clash';

export const BASE_MODEL_TYPE = 'base';
export const TARGET_MODEL_TYPE = 'target';

export const COMPARE_TYPES = {
	[DIFF_COMPARE_TYPE]: {
		label: '3d diff',
		type: DIFF_COMPARE_TYPE
	},
	[CLASH_COMPARE_TYPE]: {
		label: 'Instant clash',
		type: CLASH_COMPARE_TYPE
	}
};

export const MODEL_TYPES = {
	[BASE_MODEL_TYPE]: BASE_MODEL_TYPE,
	[TARGET_MODEL_TYPE]: TARGET_MODEL_TYPE
};

export const COMPARE_TABS = {
	DIFF: '3d diff',
	CLASH: 'Instant clash'
};

export const RENDERING_TYPES = {
	BASE: 1,
	COMPARE: 2,
	TARGET: 3
};

export const RENDERING_TYPES_LIST = [
	{
		type: RENDERING_TYPES.BASE,
		label: 'Base'
	},
	{
		type: RENDERING_TYPES.COMPARE,
		label: 'Compare'
	},
	{
		type: RENDERING_TYPES.TARGET,
		label: 'Target'
	}
];

export const COMPARE_SORT_TYPES = {
	NAME: 'name',
	TYPE: 'type'
};

export const COMPARE_ACTIONS_MENU = {
	SORT_BY_NAME: {
		name: 'sort-name',
		label: 'Sort by name',
		sortType: COMPARE_SORT_TYPES.NAME
	},
	SORT_BY_TYPE: {
		name: 'sort-type',
		label: 'Sort by type',
		sortType: COMPARE_SORT_TYPES.TYPE
	}
};

export const VULNERABLE_PROPS = [
	'activeTab',
	'selectedDiffModelsMap',
	'selectedClashModelsMap',
	'targetClashModels',
	'targetDiffModels'
];
