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

